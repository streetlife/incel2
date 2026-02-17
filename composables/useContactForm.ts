import { ref, watch } from 'vue'

export const useContactForm = () => {
  const form = ref({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const errors = ref({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
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
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    }
  }

  const validateForm = (): boolean => {
    clearErrors()
    let isValid = true

    if (form.value.name) {
      // Valid
    } else {
      errors.value.name = 'Name is required'
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

    if (form.value.subject) {
      // Valid
    } else {
      errors.value.subject = 'Subject is required'
      isValid = false
    }

    if (form.value.message) {
      // Valid
    } else {
      errors.value.message = 'Message is required'
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

  const submitMessage = (): boolean => {
    if (validateForm()) {
      return true
    }
    
    scrollToError()
    return false
  }

  const resetForm = () => {
    form.value = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    }
    clearErrors()
  }

  return {
    form,
    errors,
    setupErrorWatchers,
    validateForm,
    scrollToError,
    submitMessage,
    resetForm
  }
}
