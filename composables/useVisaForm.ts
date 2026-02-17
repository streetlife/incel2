import { ref, watch } from 'vue'

export const useVisaForm = () => {
    const currentStep = ref(1)

    const form = ref({
        nationality: '',
        visaType: '',
        passportCopy: null as File | null,
        photo: null as File | null,
        flightTicket: null as File | null,
        hotelBooking: null as File | null,
        employmentLetter: null as File | null,
        travelInsurance: null as File | null,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        passportNumber: '',
        dateOfBirth: '',
        travelDate: ''
    })

    const errors = ref({
        nationality: '',
        visaType: '',
        passportCopy: '',
        photo: '',
        flightTicket: '',
        hotelBooking: '',
        employmentLetter: '',
        travelInsurance: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        passportNumber: '',
        dateOfBirth: '',
        travelDate: '',
        general: ''
    })

    // Watch form fields and clear errors
    const setupErrorWatchers = () => {
        Object.keys(form.value).forEach(key => {
            watch(() => (form.value as any)[key], () => {
                if ((errors.value as any)[key]) {
                    (errors.value as any)[key] = ''
                }
            })
        })
    }

    const clearErrors = () => {
        errors.value = {
            nationality: '',
            visaType: '',
            passportCopy: '',
            photo: '',
            flightTicket: '',
            hotelBooking: '',
            employmentLetter: '',
            travelInsurance: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            passportNumber: '',
            dateOfBirth: '',
            travelDate: '',
            general: ''
        }
    }

    const validateStep1 = (): boolean => {
        clearErrors()

        if (form.value.nationality) {
            return true
        }

        errors.value.nationality = 'Please select your nationality'
        return false
    }

    const validateStep2 = (): boolean => {
        clearErrors()

        if (form.value.visaType) {
            return true
        }

        errors.value.visaType = 'Please select a visa type'
        return false
    }

    const validateFile = (
        field: keyof typeof form.value,
        errorMessage: string
    ): boolean => {
        if (form.value[field]) return true

        errors.value[field] = errorMessage
        return false
    }

    const validateStep3 = (requiredDocuments: string[]): boolean => {
        clearErrors()
        let isValid = true

        // Always required
        isValid &&= validateFile('passportCopy', 'Passport copy is required')
        isValid &&= validateFile('photo', 'Passport size photo is required')

        // Conditionally required
        const conditionalDocs: Record<string, { field: keyof typeof form.value; message: string }> = {
            'Confirmed flight tickets': {
                field: 'flightTicket',
                message: 'Flight ticket is required'
            },
            'Hotel booking confirmation': {
                field: 'hotelBooking',
                message: 'Hotel booking is required'
            },
            'Employment letter': {
                field: 'employmentLetter',
                message: 'Employment letter is required'
            },
            'Travel insurance': {
                field: 'travelInsurance',
                message: 'Travel insurance is required'
            }
        }

        requiredDocuments.forEach(doc => {
            const config = conditionalDocs[doc]
            if (config) {
                isValid &&= validateFile(config.field, config.message)
            }
        })

        return isValid
    }


    const validateStep4 = (): boolean => {
        clearErrors()
        let isValid = true

        const requiredFields: Array<{
            field: keyof typeof form.value
            message: string
        }> = [
                { field: 'firstName', message: 'First name is required' },
                { field: 'lastName', message: 'Last name is required' },
                { field: 'phone', message: 'Phone number is required' },
                { field: 'passportNumber', message: 'Passport number is required' },
                { field: 'dateOfBirth', message: 'Date of birth is required' }
            ]

        requiredFields.forEach(({ field, message }) => {
            if (!form.value[field]) {
                errors.value[field] = message
                isValid = false
            }
        })

        // Email
        if (!form.value.email) {
            errors.value.email = 'Email is required'
            isValid = false
        } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
            errors.value.email = 'Invalid email format'
            isValid = false
        }

        // Travel date
        if (form.value.travelDate) {
            const travelDate = new Date(form.value.travelDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            if (travelDate < today) {
                errors.value.travelDate = 'Travel date must be in the future'
                isValid = false
            }
        } else {
            errors.value.travelDate = 'Travel date is required'
            isValid = false
        }

        return isValid
    }


    const scrollToError = () => {
        const firstError = document.querySelector('.border-red-500')
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    const handleFileUpload = (event: Event, field: string) => {
        const target = event.target as HTMLInputElement
        if (target?.files?.[0]) {
            (form.value as any)[field] = target.files[0]
        }
    }

    const nextStep = (requiredDocuments?: string[]) => {
        let isValid = false

        switch (currentStep.value) {
            case 1:
                isValid = validateStep1()
                break
            case 2:
                isValid = validateStep2()
                break
            case 3:
                isValid = validateStep3(requiredDocuments || [])
                break
            default:
                isValid = true
        }

        if (isValid && currentStep.value < 4) {
            currentStep.value++
        } else if (isValid === false) {
            scrollToError()
        }
    }

    const prevStep = () => {
        if (currentStep.value > 1) {
            currentStep.value--
            clearErrors()
        }
    }

    const submitApplication = () => {
        if (validateStep4()) {
            return true
        }

        scrollToError()
        return false
    }

    return {
        currentStep,
        form,
        errors,
        setupErrorWatchers,
        clearErrors,
        validateStep1,
        validateStep2,
        validateStep3,
        validateStep4,
        scrollToError,
        handleFileUpload,
        nextStep,
        prevStep,
        submitApplication
    }
}