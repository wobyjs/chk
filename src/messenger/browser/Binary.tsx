import React, { ReactNode } from 'react'
import { ResultType } from '../../expect'

export const Binary = ({ result, subject, target, operator }: { operator: string, result: ResultType, subject: string | ReactNode, target: string | ReactNode }) =>
    <span style={{ color: result ? 'green' : 'red' }}>{subject} <b>{operator}</b> {target}</span>