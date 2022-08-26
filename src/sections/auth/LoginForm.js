// react
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// form
import { useFormik } from 'formik';
import * as yup from 'yup';
// @mui
import { TextField, Link, Stack, IconButton, InputAdornment, FormControlLabel, Checkbox } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Visibility, VisibilityOff } from '@mui/icons-material';
// firebase
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase-config';

export const LoginForm = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formSubmit, setFormSubmit] = useState(false);
  const [rememberUser, setRememberUser] = useState(true);
  const [loginError, setLoginError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [tooManyRequestsError, setTooManyRequestsError] = useState(false);

  const loginSchema = yup.object().shape({
    email: yup.string().email('Invalid Email').required('Email is Required'),
    password: yup.string().required('Password is Required'),
  });

  // on submit
  const onSubmit = async (values, actions) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      actions.resetForm();
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setLoginError(false);
      setPasswordError(false);

      if (error.code === 'auth/user-not-found') {
        setLoginError(true);
      } else if (error.code === 'auth/wrong-password') {
        setPasswordError(true);
      } else {
        setTooManyRequestsError(true);
      }

      console.log(error.code);
    }
  };

  // formik
  const { handleChange, handleBlur, values, handleSubmit, isSubmitting, errors } = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit,
  });

  return (
    <>
      <form onSubmit={handleSubmit} autoComplete="off">
        <Stack spacing={3}>
          <TextField
            label="Email Address"
            variant="outlined"
            name="email"
            margin="normal"
            onChange={handleChange}
            value={values.email}
            onBlur={handleBlur}
            error={(errors.email || loginError || tooManyRequestsError) && formSubmit}
            helperText={
              (errors.email && formSubmit ? errors.email : '') || (loginError && formSubmit ? 'User not found' : '')
            }
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            name="password"
            margin="normal"
            onChange={handleChange}
            value={values.password}
            onBlur={handleBlur}
            error={(errors.password || loginError || passwordError || tooManyRequestsError) && formSubmit}
            helperText={
              (errors.password && formSubmit ? errors.password : '') ||
              (loginError && formSubmit ? 'User not found' : '') ||
              (passwordError && formSubmit ? 'Incorrect Password' : '') ||
              (tooManyRequestsError && formSubmit ? 'Too many requests, please try again later' : '')
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
            <FormControlLabel
              control={<Checkbox defaultChecked />}
              label="Remember Me"
              onClick={() => setRememberUser(!rememberUser)}
            />
            <Link variant="subtitle2" underline="hover">
              Forgot password?
            </Link>
          </Stack>

          <LoadingButton
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            onClick={() => setFormSubmit(true)}
          >
            Login
          </LoadingButton>
        </Stack>
      </form>
    </>
  );
};
