/* eslint-disable @typescript-eslint/no-explicit-any */

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Radio from '@/components/ui/Radio';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CreateForm } from '../api/create-form';
import { useQuestion } from '../api/get-question';

interface FormData {
    firstname: string;
    lastname: string;
    experience: number;
    questionResponses: Record<number, string>; // questionId -> value

}
export const DetailForm = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        firstname: '',
        lastname: '',
        experience: 0,
        questionResponses: {},
    });

    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const questions = useQuestion({});
    const detailEvent = questions?.data;
    const ratingOptions = [
        { label: 'Strongly Agree', value: 'strong' },
        { label: 'Agree', value: 'agree' },
        { label: 'Neutral', value: 'natural' },
        { label: 'Disagree', value: 'disagree' },
        { label: 'Strongly Disagree', value: 'strong_disagree' }
    ];



    const handleInputChange = (field: keyof FormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleQuestionChange = (questionId: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            questionResponses: {
                ...prev.questionResponses,
                [questionId]: value
            }
        }));
    };

    const handleMultipleQuestionsChange = (combined: string) => {
        const [questionId, value] = combined.split(':');
        handleQuestionChange(parseInt(questionId), value);
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.firstname.trim()) {
            newErrors.firstname = 'First name is required';
        }
        if (!formData.lastname.trim()) {
            newErrors.lastname = 'Last name is required';
        }

        if (formData.experience <= 0) {
            newErrors.experience = 'Experience must be greater than 0' as any;
        }

        const hasAnsweredQuestions = Object.keys(formData.questionResponses).length > 0;
        if (!hasAnsweredQuestions && detailEvent?.data && detailEvent.data.length > 0) {
            newErrors.questionResponses = 'Please answer at least one question' as any;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const manyquestionvalue = Object.entries(formData.questionResponses).map(([questionId, value]) => ({
                id_question: parseInt(questionId),
                value: value as 'strong' | 'agree' | 'natural' | 'disagree' | 'strong_disagree'
            }));

            const submitData = {
                firstname: formData.firstname,
                lastname: formData.lastname,
                experience: formData.experience,
                manyquestionvalue
            };
            console.log('Submit data:', JSON.stringify(manyquestionvalue));
            await CreateForm({
                body: submitData
            });

            setFormData({
                firstname: '',
                lastname: '',
                experience: 0,
                questionResponses: {}
            });
            router.refresh()
            alert('Evaluation submitted successfully!');
        } catch (error) {
            alert('Error submitting evaluation. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex max-w-4xl mx-auto flex-col gap-6 py-6 px-4 lg:py-18 lg:px-20">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Supervisor Evaluation Form</h1>
                <p className="text-gray-600 mb-8">Please complete this evaluation to provide feedback on your supervisor&apos;s performance.</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information Section */}
                    <section className="border-b border-gray-200 pb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                value={formData.firstname}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('firstname', e.target.value)}
                                error={errors.firstname}
                                required
                                fullWidth
                            />
                            <Input
                                label="Last Name"
                                value={formData.lastname}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lastname', e.target.value)}
                                error={errors.lastname}
                                required
                                fullWidth
                            />

                            <Input
                                label="Experience (Years)"
                                type="number"
                                value={formData.experience.toString()}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                                error={errors.experience ? String(errors.experience) : undefined}
                                required
                                fullWidth
                            />
                        </div>
                    </section>

                    {/* Performance Evaluation Section */}
                    <section className="border-b border-gray-200 pb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Evaluation</h2>
                        {questions.isLoading ? (
                            <div className="text-center py-4">Loading questions...</div>
                        ) : questions.error ? (
                            <div className="text-red-600 py-4">Error loading questions: {questions.error.message}</div>
                        ) : (
                            <div>
                                {detailEvent?.data && detailEvent.data.length > 0 ? (
                                    <Radio
                                        questions={detailEvent.data}
                                        options={ratingOptions}
                                        values={formData.questionResponses}
                                        onChange={handleMultipleQuestionsChange}
                                        showHeader={true}
                                    />
                                ) : (
                                    <div className="text-gray-500 py-4">No questions available.</div>
                                )}
                            </div>
                        )}
                    </section>



                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                if (confirm('Are you sure you want to reset the form?')) {
                                    setFormData({
                                        firstname: '',
                                        lastname: '',
                                        experience: 0,
                                        questionResponses: {},
                                    });
                                    setErrors({});
                                }
                            }}
                        >
                            Reset Form
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            Submit Evaluation
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
