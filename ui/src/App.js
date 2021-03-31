import logo from './logo.svg';
import './App.css';
import Form from './Form';

function App() {

  var imageStyle = {
    width: '500px',
    height: '300px'
  }

  return (
    <div className="App">
      <header className="App-header">

        <p className="App-link" >
          Defi Wallet with Yearn Finance and React
        </p>

        <img src={logo} style={imageStyle} className="App-logo" alt="logo" />
        <Form/>
      </header>
    </div>
  );
}

export default App;
