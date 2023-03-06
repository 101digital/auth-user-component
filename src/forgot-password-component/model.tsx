import * as Yup from 'yup';

export class ForgotPasswordData {
    constructor(
        readonly email: string,
    ) { }

    static empty(): ForgotPasswordData {
        return new ForgotPasswordData(
            '',
        );
    }
}
const regex = /^\+?\d{9,13}$/
export const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().trim().email().required('Invalid Email!'),
});
