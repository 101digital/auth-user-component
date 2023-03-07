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
export const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().trim().email().required('This field is required'),
});
