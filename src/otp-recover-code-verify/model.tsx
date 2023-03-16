import * as Yup from 'yup';

export class RecoverCodeData {
    constructor(
        readonly recoverCode: string,
    ) { }

    static empty(): RecoverCodeData {
        return new RecoverCodeData(
            '',
        );
    }
}
export const RecoverCodeSchema = Yup.object().shape({
    recoverCode: Yup.string().trim().required('This field is required'),
});
