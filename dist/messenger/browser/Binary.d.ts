import { ReactNode } from 'react';
import { ResultType } from '../../expect';
export declare const Binary: ({ result, subject, target, operator }: {
    operator: string;
    result: ResultType;
    subject: string | ReactNode;
    target: string | ReactNode;
}) => JSX.Element;
