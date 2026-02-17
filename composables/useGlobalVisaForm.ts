import { ref, watch } from 'vue'

export const useGlobalVisaForm = () => {
  const form = ref({
    fullName: '',
    email: '',
    phone: '',
    nationality: '',
    destination: '',
    purpose: '',
    additionalInfo: ''
  })

  const errors = ref({
    fullName: '',
    email: '',
    phone: '',
    nationality: '',
    destination: '',
    purpose: '',
    general: ''
  })

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
      fullName: '',
      email: '',
      phone: '',
      nationality: '',
      destination: '',
      purpose: '',
      general: ''
    }
  }

  const validateForm = (): boolean => {
    clearErrors()
    let isValid = true

    if (form.value.fullName) {
      // Valid
    } else {
      errors.value.fullName = 'Full name is required'
      isValid = false
    }

    if (form.value.email) {
      if (/\S+@\S+\.\S+/.test(form.value.email)) {
        // Valid
      } else {
        errors.value.email = 'Invalid email format'
        isValid = false
      }
    } else {
      errors.value.email = 'Email is required'
      isValid = false
    }

    if (form.value.phone) {
      // Valid
    } else {
      errors.value.phone = 'Phone number is required'
      isValid = false
    }

    if (form.value.nationality) {
      // Valid
    } else {
      errors.value.nationality = 'Nationality is required'
      isValid = false
    }

    if (form.value.destination) {
      // Valid
    } else {
      errors.value.destination = 'Destination country is required'
      isValid = false
    }

    if (form.value.purpose) {
      // Valid
    } else {
      errors.value.purpose = 'Purpose of travel is required'
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

  const submitInquiry = (): boolean => {
    if (validateForm()) {
      return true
    }
    
    scrollToError()
    return false
  }

  const resetForm = () => {
    form.value = {
      fullName: '',
      email: '',
      phone: '',
      nationality: '',
      destination: '',
      purpose: '',
      additionalInfo: ''
    }
    clearErrors()
  }

  return {
    form,
    errors,
    setupErrorWatchers,
    validateForm,
    scrollToError,
    submitInquiry,
    resetForm
  }
}
