#[cfg(test)]
mod tests {
    use secp256k1::{PublicKey, SecretKey};

    use crate::utils::*;

    pub const F32_VECTOR_SIZE: usize = 512;

    #[test]
    fn test_works() {
        // Generate Ethereum key pair
        let skb: Vec<u8> = vec![149, 213, 23, 72, 35, 51, 30, 42, 216, 252, 168, 168, 131, 190, 239, 52, 152, 134, 21, 171, 139, 28, 167, 119, 53, 144, 122, 230, 200, 167, 3, 150];
        let pkb: Vec<u8> = vec![4, 125, 245, 230, 209, 154, 228, 64, 128, 102, 154, 182, 127, 50, 189, 65, 249, 236, 45, 105, 23, 225, 252, 180, 163, 113, 154, 69, 206, 14, 26, 136, 83, 238, 211, 31, 195, 93, 178, 137, 77, 78, 208, 205, 29, 80, 110, 221, 240, 29, 68, 229, 92, 194, 47, 104, 119, 97, 50, 188, 215, 210, 227, 69, 57];
        let sk1 = SecretKey::from_slice(&skb).unwrap();
        let pk2 = PublicKey::from_slice(&pkb).unwrap();
        
        let ss = generate_shared_secret(pk2, sk1);

        // Encrypt a vector of 512 f32 samples
        let wave_sample = vec![0.0; F32_VECTOR_SIZE]; // 512 bytes

        assert_eq!(
            wave_sample,
            convert_to_f32_vector(&convert_from_f32_vector(&wave_sample))
        );

        let binary_sample = convert_from_f32_vector(&wave_sample); // 2048 bytes
        let encrypted_binary_sample = encrypt(ss, &binary_sample); // 2048 bytes
                                                                   // Send the encrypted data to the other party
        let wave_encrypted_binary_sample = convert_to_f32_vector(&encrypted_binary_sample);

        println!("Encrypted data size: {:?}", encrypted_binary_sample.len());
        println!("Encrypted data: {:?}", wave_encrypted_binary_sample.len());

        // Decrypt the wave
        let encrypted_binary_sample_received =
            convert_from_f32_vector(&wave_encrypted_binary_sample);
        assert_eq!(encrypted_binary_sample, encrypted_binary_sample_received);

        let binary_sample_receiver = decrypt(ss, &encrypted_binary_sample_received);
        assert_eq!(binary_sample, binary_sample_receiver);

        let wave_sample_receiver = convert_to_f32_vector(&binary_sample_receiver);
        assert_eq!(wave_sample, wave_sample_receiver);
    }
}
