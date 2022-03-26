import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

export const WETH_ADDRESS = "0xc778417e063141139fce010982780140aa0cd5ab";
export const DD2_ADDRESS = "0xb1745657cb84c370dd0db200a626d06b28cc5872";
export const MASTERCHEF_ADDRESS = "0x9da687e88b0A807e57f1913bCD31D56c49C872c2";
export const ACCOUNT_ADDRESS = "0xcFd6d16c3660C4a79a71B9A06d0a680D13b115Bb";
export const INFURA_KEY = "10df728faa6e46bea492bea63eaba945";

export const WALLETCONNECT_BRIDGE_URL = "https://bridge.walletconnect.org";

export const NETWORK_URLS = {
  1: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  4: `https://rinkeby.infura.io/v3/6305f575265443c5a1e39e39f8640da5`,
  5: `https://goerli.infura.io/v3/${INFURA_KEY}`,
};

export const injected = new InjectedConnector({
  supportedChainIds: [1, 4, 5],
});

export const walletConnect = new WalletConnectConnector({
  supportedChainIds: [1, 4, 5],
  rpc: NETWORK_URLS,
  bridge: WALLETCONNECT_BRIDGE_URL,
  qrcode: true,
});
