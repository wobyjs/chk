import React from 'react'
import { ResultType } from '../../expect'

export const Result = ({ result }: { result: ResultType }) =>
    <span style={{ color: result ? 'green' : 'red' }}>{result ? '✓' : '✗'}</span>
