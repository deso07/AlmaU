import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ru } from 'date-fns/locale';
import { Provider } from 'react-redux';
import { store } from './store';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4500); // Show loading screen for 10 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            {isLoading ? <LoadingScreen /> : <AppRoutes />}
          </LocalizationProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
