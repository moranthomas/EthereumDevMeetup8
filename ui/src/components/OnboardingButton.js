import MetaMaskOnboarding from '@metamask/onboarding';
import React from 'react';

const ONBOARD_TEXT = 'Click here to install MetaMask!';
const CONNECT_TEXT = 'Connect Wallet';
const CONNECTED_TEXT = 'Wallet Connected';

export function OnboardingButton() {
  const [buttonText, setButtonText] = React.useState(ONBOARD_TEXT);
  const [isDisabled, setDisabled] = React.useState(false);
  const [accounts, setAccounts] = React.useState([]);
  const onboarding = React.useRef();

  React.useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  React.useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (accounts.length > 0) {
        setButtonText(CONNECTED_TEXT);
        setDisabled(true);
        onboarding.current.stopOnboarding();
      } else {
        setButtonText(CONNECT_TEXT);
        setDisabled(false);
      }
    }
  }, [accounts]);

  React.useEffect(() => {
    function handleNewAccounts(newAccounts) {
      setAccounts(newAccounts);
    }
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(handleNewAccounts);
      window.ethereum.on('accountsChanged', handleNewAccounts);
      return () => {
        window.ethereum.off('accountsChanged', handleNewAccounts);
      };
    }
  }, []);

  const onClick = () => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((newAccounts) => setAccounts(newAccounts));
    } else {
      onboarding.current.startOnboarding();
    }
  };

    //TODO - console.log("Need to update wallet connected in state here - using HOOKS ")

  return (

      <div style={connectorStyle}>
        <button style={connectWalletBtn} disabled={isDisabled} onClick={onClick}>
        {buttonText}
        </button>
    </div>
  );

}

const connectorStyle = {
    position: 'fixed',
    top: '10%',
    right: '10%',
    color: '#372b25',
}

const connectWalletBtn = {
    marginBottom: '15px',
    padding: '10px',
    borderRadius: '5px',
    borderColor: 'white',
    color: 'white',
    backgroundColor: '#BE9325'
  }
