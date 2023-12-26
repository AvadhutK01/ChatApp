import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import RouteDefinations from './Routes/RouteDefinations';
import { AuthProvider } from './AuthProviders/AuthContext';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <AuthProvider>
          <RouteDefinations />
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
