import { LoginForm } from "../components/LoginForm";
import { Container } from '@mui/material';

export function LoginPage() {
    return (
        <Container component="main" maxWidth="xs">
            <LoginForm />
        </Container>
    )
}