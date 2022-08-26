// react
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// form
import { useFormik } from 'formik';
import * as yup from 'yup';
// @mui
import { TextField, Stack, IconButton, InputAdornment, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Visibility, VisibilityOff } from '@mui/icons-material';
// firebase
import { createUserWithEmailAndPassword, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, usersCollectionRef } from '../../firebase-config';

export const RegisterForm = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formSubmit, setFormSubmit] = useState(false);
  const [emailInUseError, setEmailInUseError] = useState(false);

  // yup register schema - form error handling
  const registerSchema = yup.object().shape({
    firstName: yup.string().required('First Name is required'),
    lastName: yup.string().required('Last Name is required'),
    email: yup.string().email('Invalid Email').required('Email is Required'),
    password: yup
      .string()
      .min(8, 'Password Too Short')
      // eslint-disable-next-line no-useless-escape
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/, {
        message: 'Password Too Weak',
      })
      .required('Password is Required'),
  });

  // on submit function - creates new firebase user and logs data to firestore
  const onSubmit = async (values, actions) => {
    // 500ms delay to show loading animation on button
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // creating user with firebase
      const cred = await createUserWithEmailAndPassword(auth, values.email, values.password);

      const userData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      };

      const fullName = `${values.firstName} ${values.lastName}`;

      // creating doc in users collection with the docid being the same as the uid
      await setDoc(doc(db, usersCollectionRef.id, cred.user.uid), userData);

      // updating user profile to include user's full name & last name
      await updateProfile(auth.currentUser, {
        displayName: fullName,
        photoURL: '/static/mock-images/avatars/avatar_1.jpg',
      });

      // clears form
      actions.resetForm();

      // redirects to /dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setEmailInUseError(true);
      } else {
        console.log(error);
      }
    }
  };

  // firebase user auth
  const [user, setUser] = useState({});

  // listens for auth changes - once the user is signed in, they remained signed in
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  // formik hook
  const { handleChange, handleBlur, values, handleSubmit, isSubmitting, errors } = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
    validationSchema: registerSchema,
    onSubmit,
  });

  return (
    <>
      <form onSubmit={handleSubmit} autoComplete="off">
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="First Name"
              variant="outlined"
              name="firstName"
              fullWidth
              onChange={handleChange}
              value={values.firstName}
              onBlur={handleBlur}
              error={errors.firstName && formSubmit}
              helperText={errors.firstName && formSubmit ? errors.firstName : ''}
            />

            <TextField
              label="Last Name"
              variant="outlined"
              name="lastName"
              fullWidth
              onChange={handleChange}
              value={values.lastName}
              onBlur={handleBlur}
              error={errors.lastName && formSubmit}
              helperText={errors.lastName && formSubmit ? errors.lastName : ''}
            />
          </Stack>

          <TextField
            label="Email Address"
            variant="outlined"
            name="email"
            margin="normal"
            onChange={handleChange}
            value={values.email}
            onBlur={handleBlur}
            error={(errors.email || emailInUseError) && formSubmit}
            // eslint-disable-next-line no-nested-ternary
            helperText={
              (errors.email && formSubmit ? errors.email : '') ||
              (emailInUseError && formSubmit ? 'Email Already In Use' : '')
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
            error={errors.password && formSubmit}
            helperText={errors.password && formSubmit ? errors.password : ''}
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

          <LoadingButton
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            onClick={() => setFormSubmit(true)}
          >
            <Typography variant="subtitle1">Sign up</Typography>
          </LoadingButton>
        </Stack>
      </form>
    </>
  );
};
