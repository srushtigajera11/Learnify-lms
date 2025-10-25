import React from "react";
import {Box, Typography , Paper,Stack} from "@mui/material";

const WelcomeBanner = ({user}) =>{
    return(
        <Box sx={{  background: "linear-gradient(135deg, #c7d2fe 0%, #d9f99d 100%)",
            p : {xs :3, md:3},
            display:"flex",
            justifyContent : "space-between",
            alignItems : "center",
        }}
        >
            {/* Left : Welocome */}
            <Typography variant="h4" fontWeight="bold">
                Welcome Back, {user?.name || "Tutor"}!
            </Typography>

            {/* right stats */}
            <Stack direction={"row"} spacing={2}>
                <Paper elevation={2} sx={{px:3,py:1.5,borderRadius:2}}>
                    <Typography fontWeight="bold">Courses : 5</Typography>
                </Paper>
                <Paper elevation={2} sx={{ px: 3, py: 1.5, borderRadius: 2 }}>
                    <Typography fontWeight="bold">Completed: 2</Typography>
                </Paper>
               

                {/* <Paper elevation={2} sx={{ px: 3, py: 1.5, borderRadius: 2 }}>
                    <Typography fontWeight="bold">Certificates: 1</Typography>
                </Paper>  */}
            </Stack>

        </Box>
    );

};

export default WelcomeBanner;