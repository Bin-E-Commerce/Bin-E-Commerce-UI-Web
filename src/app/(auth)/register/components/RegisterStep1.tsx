'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import type { UseFormReturn } from 'react-hook-form';
import type { RegisterFormValues } from '../schemas/registerSchema';

interface RegisterStep1Props {
    form: UseFormReturn<RegisterFormValues>;
    onSubmit: (values: RegisterFormValues) => Promise<void>;
}
