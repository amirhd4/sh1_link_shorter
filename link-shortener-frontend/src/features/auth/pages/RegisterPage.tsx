import { RegisterForm } from "../components/RegisterForm";
import { Container } from '@mui/material';

export function RegisterPage() {
    return (
        <Container component="main" maxWidth="xs">
            <RegisterForm />
        </Container>
    )
}