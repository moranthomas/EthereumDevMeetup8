import logo from './logo.svg';
import './App.css';
import Form from './Form';
import { OnboardingButton } from './components/OnboardingButton';

function App() {

  var imageStyle = {
    width: '250px',
    height: '100px'
  }

  return (
    <div className="App">
      <header className="App-header">

        <p className="App-link" >
          React Yearn Defi Wallet
        </p>

        <OnboardingButton></OnboardingButton>

        <img src={logo} style={imageStyle} className="App-logo" alt="logo" />
        <Form/>
      </header>
    </div>
  );
}

export default App;
