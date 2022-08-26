// material
import { Stack, Button, Typography } from '@mui/material';
import { Google } from '@mui/icons-material';
// firebase
import { signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, usersCollectionRef, db } from '../../firebase-config';

// ----------------------------------------------------------------------

export default function AuthSocial() {
  const navigate = useNavigate();

  const googleProvider = new GoogleAuthProvider();

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const displayName = result.user.displayName.split(' ');
    const lastName = displayName[1] ? displayName[1] : '';
    const fullName = `${displayName[0]} ${lastName}`;

    const userData = {
      firstName: displayName[0],
      // eslint-disable-next-line object-shorthand
      lastName: lastName,
      email: result.user.email,
    };

    await setDoc(doc(db, usersCollectionRef.id, result.user.uid), userData);
    await updateProfile(auth.currentUser, {
      displayName: fullName,
    });
    navigate('/dashboard', { replace: true });
  };

  return (
    <>
      {/* <Divider sx={{ my: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          OR
        </Typography>
      </Divider> */}
      <Stack direction="row" spacing={2}>
        <Button sx={{ mt: 2.5 }} fullWidth size="large" color="inherit" variant="outlined" onClick={signInWithGoogle}>
          <Google sx={{ color: '#DF3E30' }} width={22} height={22} />
          <Typography sx={{ color: 'text.primary', paddingLeft: 1 }} variant="subtitle1">
            Sign in with Google
          </Typography>
        </Button>
      </Stack>
    </>
  );
}
