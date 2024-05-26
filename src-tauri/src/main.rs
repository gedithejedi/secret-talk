#[cfg(test)]
mod tests;
mod utils;

use cpal::{
    traits::{DeviceTrait, HostTrait, StreamTrait},
    Device, Stream, StreamConfig,
};
use secp256k1::{ecdh::SharedSecret, PublicKey, SecretKey};
use std::{
    sync::{Arc, Mutex},
    thread,
    time::Duration,
};

use utils::*;

struct State {
    stop_signal: Arc<Mutex<bool>>
}

fn main() {
    tauri::Builder::default()
        .manage(State {
            stop_signal: Arc::new(Mutex::new(false)),
        })
        .invoke_handler(tauri::generate_handler![start, stop])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

const BLACKHOLE: &str = "BlackHole 2ch";

#[tauri::command]
fn start(state: tauri::State<'_, State>, emission: bool) {
    let stop_signal = state.stop_signal.clone();
    *stop_signal.lock().unwrap() = false; // Reset stop signal
    println!("START! ");

    thread::spawn(move || {
        let host = cpal::default_host();

        let input_device = if emission {
            host.default_input_device()
        } else {
            host.input_devices()
                .unwrap()
                .find(|x| x.name().map(|y| y == BLACKHOLE).unwrap_or(false))
        }
        .expect("failed to find input device");

        let output_device = if emission {
            host.devices().unwrap().find(|x| {
                x.name()
                    .map(|y| {
                        println!("x: {:?}", y);
                        y == BLACKHOLE
                    })
                    .unwrap_or(false)
            })
        } else {
            host.default_output_device()
        }
        .expect("failed to find output device");

        println!("Using input device: \"{}\"", input_device.name().unwrap());
        println!("Using output device: \"{}\"", output_device.name().unwrap());

        // We'll try and use the same configuration between streams to keep it simple.
        let config: cpal::StreamConfig = input_device.default_input_config().unwrap().into();

        let shared_buffer = Arc::new(Mutex::new(Vec::new()));
        let input_buffer = Arc::clone(&shared_buffer);
        let output_buffer = Arc::clone(&shared_buffer);

        let skb: Vec<u8> = vec![
            149, 213, 23, 72, 35, 51, 30, 42, 216, 252, 168, 168, 131, 190, 239, 52, 152, 134, 21,
            171, 139, 28, 167, 119, 53, 144, 122, 230, 200, 167, 3, 150,
        ];
        let pkb: Vec<u8> = vec![
            4, 125, 245, 230, 209, 154, 228, 64, 128, 102, 154, 182, 127, 50, 189, 65, 249, 236,
            45, 105, 23, 225, 252, 180, 163, 113, 154, 69, 206, 14, 26, 136, 83, 238, 211, 31, 195,
            93, 178, 137, 77, 78, 208, 205, 29, 80, 110, 221, 240, 29, 68, 229, 92, 194, 47, 104,
            119, 97, 50, 188, 215, 210, 227, 69, 57,
        ];
        let sk1 = SecretKey::from_slice(&skb).unwrap();
        let pk2 = PublicKey::from_slice(&pkb).unwrap();

        let shared_secret = generate_shared_secret(pk2, sk1);

        let (input_stream, output_stream) = if emission {
            start_secret_talk_emission(
                shared_secret,
                input_buffer,
                output_buffer,
                input_device,
                output_device,
                config,
            )
            .unwrap()
        } else {
            start_secret_talk_reception(
                shared_secret,
                input_buffer,
                output_buffer,
                input_device,
                output_device,
                config,
            )
            .unwrap()
        };

        println!("Successfully built streams.");

        input_stream.play().unwrap();
        output_stream.play().unwrap();

        loop {
            {
                let stop = stop_signal.lock().unwrap();
                if *stop {
                    break;
                }
            }
            thread::sleep(Duration::from_secs(1));
        }

        drop(input_stream);
        drop(output_stream);
    });
}

#[tauri::command]
fn stop(state: tauri::State<'_, State>) {
    let mut stop = state.stop_signal.lock().unwrap();
    println!("STOP! ");
    *stop = true;
}

fn err_fn(err: cpal::StreamError) {
    eprintln!("an error occurred on stream: {}", err);
}

const BUFFER_SIZE: usize = 512;

fn start_secret_talk_emission(
    shared_secret: SharedSecret,
    input_buffer: Arc<Mutex<Vec<f32>>>,
    output_buffer: Arc<Mutex<Vec<f32>>>,
    input_device: Device,
    output_device: Device,
    config: StreamConfig,
) -> anyhow::Result<(Stream, Stream)> {
    let count = Arc::new(Mutex::new(0));

    let input_data_fn = move |data: &[f32], _: &cpal::InputCallbackInfo| {
        // print the sum of the input data
        let sample = data.to_owned();

        if sample.len() == BUFFER_SIZE {
            let binary_sample = convert_from_f32_vector(&sample); // 2048 bytes
            let encrypted_binary_sample = encrypt(shared_secret, &binary_sample); // 2048 bytes
            let sample = convert_to_f32_vector(&encrypted_binary_sample); // 512 bytes (change this name transmit real audio)º

            let mut buffer = input_buffer.lock().unwrap();
            buffer.extend_from_slice(&sample);
        } else {
            println!("Sample size is not 512");
        }
    };

    let output_data_fn = move |data: &mut [f32], _: &cpal::OutputCallbackInfo| {
        let mut ddata = Vec::with_capacity(data.len());

        let mut c = count.lock().unwrap();
        *c += 1;

        if *c % 100 == 0 {
            println!("syncing...");
            ddata.extend_from_slice(&[-1f32, 1f32]);
        }

        let mut buffer = output_buffer.lock().unwrap();

        let sample = buffer
            .drain(0..(data.len() - ddata.len()))
            .collect::<Vec<f32>>();

        data.copy_from_slice(&vec![ddata, sample].concat());
    };

    let input_stream = input_device.build_input_stream(&config, input_data_fn, err_fn, None)?;
    let output_stream = output_device.build_output_stream(&config, output_data_fn, err_fn, None)?;

    Ok((input_stream, output_stream))
}

fn start_secret_talk_reception(
    shared_secret: SharedSecret,
    input_buffer: Arc<Mutex<Vec<f32>>>,
    output_buffer: Arc<Mutex<Vec<f32>>>,
    input_device: Device,
    output_device: Device,
    config: StreamConfig,
) -> anyhow::Result<(Stream, Stream)> {
    let count = Arc::new(Mutex::new(0));

    let input_data_fn = move |data: &[f32], _: &cpal::InputCallbackInfo| {
        let mut c = count.lock().unwrap();
        let mut buffer = input_buffer.lock().unwrap();
        
        for i in 0..data.len() - 1 {
            if data[i] == -1f32 && data[i + 1] == 1f32 {
                buffer.extend_from_slice(&data[i + 2..]);
                *c += 1;
                println!("synced");
                return;
            }
        }

        if *c > 0 {
            buffer.extend_from_slice(&data);
            *c += 1;
        } else {
            println!("not synced");
        }
    };

    let output_data_fn = move |data: &mut [f32], _: &cpal::OutputCallbackInfo| {
        let mut buffer = output_buffer.lock().unwrap();

        if buffer.len() > data.len() {
            let wave_encrypted_binary_sample = buffer.drain(0..data.len()).collect::<Vec<f32>>();

            let encrypted_binary_sample = convert_from_f32_vector(&wave_encrypted_binary_sample);
            let binary_sample = decrypt(shared_secret, &encrypted_binary_sample);
            let sample: Vec<f32> = convert_to_f32_vector(&binary_sample);

            data.copy_from_slice(&sample);
        }
    };

    let input_stream = input_device.build_input_stream(&config, input_data_fn, err_fn, None)?;
    let output_stream = output_device.build_output_stream(&config, output_data_fn, err_fn, None)?;

    Ok((input_stream, output_stream))
}
