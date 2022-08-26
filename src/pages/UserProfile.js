import {
  Container,
  Stack,
  Card,
  Typography,
  Grid,
  TextField,
  Avatar,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { GppBad, GppGood, Close } from '@mui/icons-material';
import { useFormik } from 'formik';
import { useState } from 'react';
import * as yup from 'yup';
import 'yup-phone';
import { useAuthState } from 'react-firebase-hooks/auth';
import { setDoc, doc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import Page from '../components/Page';
import { db, usersCollectionRef, auth } from '../firebase-config';

export const UserProfile = () => {
  const [user] = useAuthState(auth);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);

  const emailVerified = user ? user.emailVerified : false;
  const phoneRegExp = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/;

  const updateProfileSchema = yup.object().shape({
    firstName: yup.string(),
    lastName: yup.string(),
    email: yup.string().email('Invalid Email'),
    phone: yup.string().phone('', false, 'Phone Number is not valid').matches(phoneRegExp, 'Phone Number is not valid'),
  });

  const displayName = user ? user.displayName.split(' ') : '';
  const userLastName = displayName[1] ? displayName[1] : '';
  const userEmail = user ? user.email : '';
  const userPhone = user ? user.phoneNumber : '';

  const photoURL = user ? user.photoURL : '';
  const oldURL = 's96-c';
  const newURL = 's400-c';
  const newPhotoURL = photoURL.replace(oldURL, newURL);

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const userData = {
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
    };

    const fullName = `${values.firstName} ${values.lastName}`;

    try {
      await setDoc(doc(db, usersCollectionRef.id, user.uid), userData);

      await updateProfile(auth.currentUser, {
        displayName: fullName,
      });

      console.log(user);
      setSuccess(true);
      setOpen(true);
    } catch (error) {
      console.log(error);
      setOpen(true);
    }
  };

  const [formSubmit, setFormSubmit] = useState(false);

  const { handleChange, handleBlur, values, handleSubmit, isSubmitting, errors } = useFormik({
    initialValues: {
      firstName: displayName[0],
      lastName: userLastName,
      email: userEmail,
      phone: userPhone,
    },
    validationSchema: updateProfileSchema,
    onSubmit,
  });

  return (
    <>
      <Page title="User Profile">
        <Container>
          <Grid container spacing={2}>
            <Grid xs={7}>
              <Stack alignItems="left" justifyContent="space-between" sx={{ ml: 2, mr: 5 }}>
                <Typography variant="h4" gutterBottom>
                  User Profile
                </Typography>
                <Typography mb={3}>
                  Here you can edit your user profile. Changes are only saved if you hit the 'Save Changes' button and
                  are applied instantly!
                </Typography>
                <form onSubmit={handleSubmit} autoComplete="off">
                  <Card sx={{ pt: 3, pb: 3, pl: 2, pr: 2, mb: 2 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} marginBottom={3}>
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
                      label="Email"
                      variant="outlined"
                      name="email"
                      fullWidth
                      disabled
                      onChange={handleChange}
                      value={values.email}
                      onBlur={handleBlur}
                      error={errors.email && formSubmit}
                      helperText={errors.email && formSubmit ? errors.email : ''}
                      sx={{ mb: 3 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton edge="end">
                              {emailVerified ? (
                                <Tooltip title="Email Verified!">
                                  <GppGood />
                                </Tooltip>
                              ) : (
                                <Tooltip title="Email Not Verified!">
                                  <GppBad />
                                </Tooltip>
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      label="Phone Number"
                      variant="outlined"
                      name="phone"
                      fullWidth
                      onChange={handleChange}
                      value={values.phone}
                      onBlur={handleBlur}
                      error={errors.phone && formSubmit}
                      helperText={errors.phone && formSubmit ? 'Invalid Phone Number' : ''}
                    />
                  </Card>
                  <LoadingButton
                    size="large"
                    type="submit"
                    variant="contained"
                    fullWidth
                    loading={isSubmitting}
                    onClick={() => setFormSubmit(true)}
                    onSubmit={handleSubmit}
                  >
                    Save Changes
                  </LoadingButton>
                </form>
                {success ? (
                  <Collapse in={open}>
                    <Alert
                      severity="success"
                      action={
                        <IconButton
                          aria-label="close"
                          color="inherit"
                          size="small"
                          onClick={() => {
                            setOpen(false);
                          }}
                        >
                          <Close fontSize="inherit" />
                        </IconButton>
                      }
                      sx={{ mt: 2 }}
                    >
                      Success! Your profile has been updated!
                    </Alert>
                  </Collapse>
                ) : (
                  <Collapse in={open}>
                    <Alert
                      severity="error"
                      action={
                        <IconButton
                          aria-label="close"
                          color="inherit"
                          size="small"
                          onClick={() => {
                            setOpen(false);
                          }}
                        >
                          <Close fontSize="inherit" />
                        </IconButton>
                      }
                      sx={{ mt: 2 }}
                    >
                      Error! We couldn't update your profile at this time.
                    </Alert>
                  </Collapse>
                )}
              </Stack>
            </Grid>
            <Grid xs={4}>
              <Stack>
                <Typography variant="h6" gutterBottom>
                  Profile Picture
                </Typography>

                <Avatar src={user ? newPhotoURL : ''} sx={{ height: 256, width: 256, alignSelf: 'center' }} />
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Page>
    </>
  );
};
