import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Link,
  Grid,
  Alert,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();
  
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Basic auth info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Additional info
  const [university, setUniversity] = useState('');
  const [faculty, setFaculty] = useState('');
  const [year, setYear] = useState('');
  const [phone, setPhone] = useState('');
  const [about, setAbout] = useState('');
  
  const [formError, setFormError] = useState('');
  
  const steps = ['Основная информация', 'Данные профиля'];
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    try {
      // Validate form data
      if (activeStep === 0) {
        if (!email || !password || !confirmPassword || !firstName || !lastName) {
          setFormError('Пожалуйста, заполните все обязательные поля');
          return;
        }
        
        if (password !== confirmPassword) {
          setFormError('Пароли не совпадают');
          return;
        }
        
        if (password.length < 6) {
          setFormError('Пароль должен содержать не менее 6 символов');
          return;
        }
        
        // Move to next step
        setActiveStep(1);
      } else {
        // Combine first and last name for displayName
        const displayName = `${firstName} ${lastName}`.trim();
        
        // Additional data for user profile
        const userData = {
          university,
          faculty,
          year,
          phone,
          about
        };
        
        // Register user with all collected data
        await register(email, password, displayName, userData);
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };
  
  const handleBack = () => {
    setActiveStep(0);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 8,
          borderRadius: 2,
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)'
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography component="h1" variant="h5" fontWeight="bold">
            Регистрация
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Создайте аккаунт для доступа к платформе
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleRegister}>
          {activeStep === 0 ? (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="Имя"
                    placeholder="Введите имя"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Фамилия"
                    placeholder="Введите фамилию"
                    name="lastName"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email адрес"
                    placeholder="Введите email"
                    name="email"
                    autoComplete="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Пароль"
                    placeholder="Введите пароль"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    helperText="Не менее 6 символов"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Повторите пароль"
                    placeholder="Подтвердите пароль"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={toggleConfirmPasswordVisibility}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Загрузка...' : 'Продолжить'}
              </Button>
            </>
          ) : (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="university"
                    label="Университет"
                    placeholder="Введите название университета"
                    name="university"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="faculty"
                    label="Факультет"
                    placeholder="Введите название факультета"
                    name="faculty"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="year-label">Курс</InputLabel>
                    <Select
                      labelId="year-label"
                      id="year"
                      value={year}
                      label="Курс"
                      onChange={(e) => setYear(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">Выберите курс</MenuItem>
                      <MenuItem value="1">1 курс</MenuItem>
                      <MenuItem value="2">2 курс</MenuItem>
                      <MenuItem value="3">3 курс</MenuItem>
                      <MenuItem value="4">4 курс</MenuItem>
                      <MenuItem value="5">5 курс</MenuItem>
                      <MenuItem value="6">6 курс</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="phone"
                    label="Телефон"
                    placeholder="Введите номер телефона"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="about"
                    label="О себе"
                    placeholder="Расскажите немного о себе"
                    name="about"
                    multiline
                    rows={3}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mb: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                >
                  Назад
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Загрузка...' : 'Зарегистрироваться'}
                </Button>
              </Box>
            </>
          )}
          
          <Grid container justifyContent="center" sx={{ mt: 2 }}>
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Уже есть аккаунт? Войти
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
