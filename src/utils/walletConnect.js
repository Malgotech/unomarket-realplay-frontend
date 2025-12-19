import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';

// Initialize WalletConnect provider
export const initWalletConnect = async () => {
  const provider = await EthereumProvider.init({
    projectId: '27f82ccd87cc28c5979bb5440a2c142c', // Get from walletconnect.com
    chains: [1], // Mainnet
    optionalChains: [1,137, 56, 42161], // Polygon, BSC, Arbitrum
    methods: [
      'eth_sendTransaction',
      'personal_sign',
      'eth_signTypedData',
      'eth_signTypedData_v4'
    ],
    events: ['chainChanged', 'accountsChanged'],
    showQrModal: true,
    qrModalOptions: {
      themeMode: 'light',
      themeVariables: {
        '--wcm-z-index': '9999' // Ensure it appears above your modal
      }
    }
  });

  return provider;
};