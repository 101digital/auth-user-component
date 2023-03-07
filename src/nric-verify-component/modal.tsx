import * as Yup from 'yup';

export class NricverifyData {
    constructor(
        readonly nric: string,
    ) { }

    static empty(): NricverifyData {
        return new NricverifyData(
            '',
        );
    }
}
export const NricverifySchema = Yup.object().shape({
    nric: Yup.string().trim().required('This field is required'),
});
