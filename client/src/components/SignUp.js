import React, { useRef, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { each } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronCircleRight } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { store } from 'react-notifications-component'
import Loader from 'react-loader-spinner'
import { loginUser } from '../actions'
import { removeAuthToken } from '../utils/auth-helper'

const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

function SignUp(props) {
  const [submitted, setSubmitted] = useState(false)
  const [signForm, setSignForm] = useState({
    name: '',
    about: '',
    email: '',
    gender: '',
    password: ''
  })

  const [signError, setSignError] = useState({
    name: '',
    about: '',
    email: '',
    gender: '',
    password: ''
  })
  const [tab, setTab] = useState(0)

  const imagePreview = useRef(null)
  const fileUpload = useRef(null)
  const [avatarFile, setAvatarFile] = useState(null)

  const validateError = (name, value) => {
    let error = ''
    switch (name) {
    case 'email':
      error = emailRegex.test(value)
        ? ''
        : 'Email is not valid!'
      break
    case 'password':
      error = value.length < 8
        ? 'Password must be 8 characters long!'
        : ''
      break
    case 'about':
      error = ''
      break
    default:
      error = value
        ? ''
        : `${name} is required!`
      break
    }

    setSignError(prevState => ({
      ...prevState,
      [name]: error
    }))

    return error
  }

  const updateField = e => {
    const { name, value } = e.target
    setSignForm(prevState => ({
      ...prevState,
      [name]: value
    }))
    validateError(name, value)
  }

  const onSignOnNext = (e) => {
    e.preventDefault()
    let valid = true
    each(signForm, (eVal, ekey) => {
      const err = validateError(ekey, eVal)
      if (err) {
        valid = false
      }
    })

    setSignForm(prevState => ({
      ...prevState,
      gender: prevState.gender.toLowerCase()
    }))
    valid && setTab(1)
  }

  const readURL = () => {
    const input = fileUpload.current
    const imagePreviewBox = imagePreview.current
    const file = input.files && input.files[0]
    if (file) {
      const imageType = /image.*/
      if (!file || !file.type.match(imageType)) {
        store.addNotification({
          title: 'Error!',
          message: 'Invalid Image Format',
          type: 'danger',
          insert: 'top',
          container: 'top-right',
          animationIn: ['animated', 'fadeIn', 'jackInTheBox'],
          animationOut: ['animated', 'fadeOut'],
          dismiss: {
            duration: 3000,
            pauseOnHover: true
          }
        })
        return
      }

      const reader = new FileReader()

      reader.onload = function (e) {
        setAvatarFile(file)
        imagePreviewBox.style.backgroundImage = `url(${e.target.result})`
      }

      reader.readAsDataURL(file)
      imagePreviewBox.className += ' js--no-default'
    }
  }

  const onSignOnSubmit = async (e) => {
    try {
      setSubmitted(true)
      e.preventDefault()
      removeAuthToken()

      // Submit the user first and avatar if exists
      const added = await axios.post('/users', signForm)

      // Upload Avatar
      if (avatarFile) {
        const formData = new FormData()
        formData.append('avatar', avatarFile)
        const config = {
          headers: {
            'content-type': 'multipart/form-data'
          }
        }
        await axios.post(`/users/${added.data.user._id}/avatar`, formData, config)
      }

      // since we handle the redirect within our component, we don't need to pass in this.props.history as a parameter
      // await props.loginUser({
      //   email: signForm.email,
      //   password: signForm.password,
      // })
      props.history.push('/sign-in')
      store.addNotification({
        title: 'Success',
        message: 'Saved Successfully !!! Please sign-in',
        type: 'success',
        insert: 'top',
        container: 'top-right',
        animationIn: ['animated', 'fadeIn', 'jackInTheBox'],
        animationOut: ['animated', 'fadeOut'],
        dismiss: {
          duration: 3000,
          pauseOnHover: true
        }
      })
    } catch (err) {
      console.log('Error on SignUp', err)
      store.addNotification({
        title: 'Try again !',
        message: 'Failed to SignUp',
        type: 'danger',
        insert: 'top',
        container: 'top-right',
        animationIn: ['animated', 'fadeIn', 'jackInTheBox'],
        animationOut: ['animated', 'fadeOut'],
        dismiss: {
          duration: 3000,
          pauseOnHover: true
        }
      })
    } finally {
      setSubmitted(false)
    }
  }

  useEffect(() => {
    if (props.auth && props.auth.email) {
      props.history.push('/dashboard') // push user to dashboard if they are loggedin
    }
  }, [props.auth])

  const loadSubmitForm = () => (
    <div className="sign-up">
      <div className="form-group">
        <label>Username</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter Name"
          name="name"
          value={signForm.name}
          onChange={updateField}
        />
        {signError.name.length > 0 &&
        <span className="error">{signError.name}</span>}
      </div>

      <div className="form-group">
        <label>Email address</label>
        <input
          type="email"
          className="form-control"
          placeholder="Enter email"
          name="email"
          value={signForm.email}
          onChange={updateField}
        />
        {signError.email.length > 0 &&
        <span className="error">{signError.email}</span>}
      </div>

      <div className="form-group">
        <label>Gender</label>
        <div className="btn-group btn-toggle gender" style={{ paddingLeft: '10px' }}>
          <input
            type="button"
            name="gender"
            className={signForm.gender === 'Male' ? 'btn btn-primary' : 'btn btn-outline-secondary'}
            value="Male"
            onClick={updateField}
          />
          <input
            type="button"
            name="gender"
            className={signForm.gender === 'Female' ? 'btn btn-primary' : 'btn btn-outline-secondary'}
            value="Female"
            onClick={updateField}
          />
        </div>
        <div className="form-group">
          {signError.gender.length > 0 &&
        <span className="error">{signError.gender}</span>}
        </div>
      </div>


      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          placeholder="Enter password"
          name="password"
          value={signForm.password}
          onChange={updateField}
        />
        {signError.password.length > 0 &&
        <span className="error">{signError.password}</span>}
      </div>

      <button type="submit" className="btn btn-primary btn-block" onClick={onSignOnNext}>
        Next&nbsp;
        <FontAwesomeIcon icon={faChevronCircleRight} aria-hidden="true" />
      </button>

      <div className="form-group">
        <p className="forgot-password text-right">
          Already registered
          <Link to="/sign-in"> sign in?</Link>
        </p>
      </div>
    </div>
  )

  const loadAvatar = () => (
    <div className="sign-up">
      <div className="form-group">
        <label htmlFor="status">Status</label>
        <input
          type="text"
          className="form-control"
          name="about"
          placeholder="Enter your Status"
          value={signForm.about}
          onChange={updateField}
        />
      </div>
      <div className="form-group">
        <label>Upload Profile Picture</label>
        <div className="image-wrapper">
          <div className="box">
            <div ref={imagePreview} className="js--image-preview" />
            <div className="upload-options">
              <label>
                <input ref={fileUpload} type="file" onChange={readURL} className="image-upload" accept="image/*" />
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="form-group">
        {
          submitted ? (
            <button className="btn btn-success btn-block">
              <Loader className="chatLoader" type="ThreeDots" height={30} width={60} />
            </button>
          ) : (
            <button type="submit" className="btn btn-primary btn-block">
              Submit
            </button>
          )}
      </div>
    </div>
  )


  return (
    <div className="auth-inner">
      <form className={submitted ? 'disabled-state' : ''} noValidate onSubmit={onSignOnSubmit}>
        <h3>Sign Up</h3>
        {tab === 0 ? loadSubmitForm() : loadAvatar()}
      </form>
    </div>
  )
}

const mapStateToProps = state => ({
  auth: state.auth
})

export default connect(
  mapStateToProps,
  { loginUser }
)(SignUp)
