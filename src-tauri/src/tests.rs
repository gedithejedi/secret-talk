#[cfg(test)]
mod tests {
    use crate::utils::*;

    pub const F32_VECTOR_SIZE: usize = 512;

    #[test]
    fn test_works() {
        // Generate Ethereum key pair
        let ((sk1, pk1), (sk2, pk2)) = generate_ethereum_accounts();
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

        let ss_receiver = generate_shared_secret(pk1, sk2);
        assert_eq!(ss, ss_receiver);

        let binary_sample_receiver = decrypt(ss_receiver, &encrypted_binary_sample_received);
        assert_eq!(binary_sample, binary_sample_receiver);

        let wave_sample_receiver = convert_to_f32_vector(&binary_sample_receiver);
        assert_eq!(wave_sample, wave_sample_receiver);
    }
}
