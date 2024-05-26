use aes_gcm::{aead::Aead, Aes128Gcm, Key, KeyInit, Nonce};
use secp256k1::{ecdh::SharedSecret, PublicKey as SecpPublicKey, SecretKey};
use std::convert::TryInto;

// use secp256k1::{rand, Secp256k1};
// pub fn generate_ethereum_accounts() -> ((SecretKey, SecpPublicKey), (SecretKey, SecpPublicKey)) {
//   let s = Secp256k1::new();
//   let (sk1, pk1) = s.generate_keypair(&mut rand::thread_rng());
//   let (sk2, pk2) = s.generate_keypair(&mut rand::thread_rng());
//   ((sk1, pk1), (sk2, pk2))
// }

pub fn generate_shared_secret(pk: SecpPublicKey, sk: SecretKey) -> SharedSecret {
  let shared_secret = SharedSecret::new(&pk, &sk);
  shared_secret
}

pub fn encrypt(shared_secret: SharedSecret, data: &[u8]) -> Vec<u8> {
  let nonce = Nonce::from_slice(&[0; 12]);

  let ss = shared_secret.secret_bytes();
  let key = Key::<Aes128Gcm>::from_slice(&ss[0..16]);

  let cipher = Aes128Gcm::new(key);

  cipher.encrypt(nonce, data).unwrap()
}

pub fn decrypt(shared_secret: SharedSecret, data: &[u8]) -> Vec<u8> {
  let nonce = Nonce::from_slice(&[0; 12]);

  let ss = shared_secret.secret_bytes();
  let key = Key::<Aes128Gcm>::from_slice(&ss[0..16]);

  let cipher = Aes128Gcm::new(key);

  cipher.decrypt(nonce, data).unwrap()
}

pub fn convert_to_f32_vector(data: &[u8]) -> Vec<f32> {
  data.chunks(4)
      .map(|chunk| f32::from_ne_bytes(chunk.try_into().unwrap()))
      .collect()
}

pub fn convert_from_f32_vector(data: &[f32]) -> Vec<u8> {
  data.into_iter().flat_map(|f| f.to_ne_bytes()).collect()
}