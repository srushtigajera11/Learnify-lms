import { Box } from "@mui/material";


export const Profile = () => {
return (
<Box>
<Typography variant="h5" fontWeight="bold">
Profile
</Typography>
<Typography variant="body2" color="text.secondary" mb={3}>
Admin account information
</Typography>


<Typography>Email: admin@learnify.com</Typography>
<Typography mt={1}>Role: Administrator</Typography>
</Box>
);
};