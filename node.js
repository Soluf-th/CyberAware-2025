const { Web3Auth } = require('@web3auth/node-sdk');

const web3auth = new Web3Auth({
  clientId: 'BMr0O5PJ9LcLwXbcEMD4h7Sg2m6LxXaYNZ-0bIOZDIjZb7G0m6bO2wLlAJi6ZcwHBvuF_ITVFxC102IyYi4bJfw', 
  web3AuthNetwork: 'sapphire_mainnet', // or 'sapphire_devnet'
});

// Initialize the instance
await web3auth.init();
