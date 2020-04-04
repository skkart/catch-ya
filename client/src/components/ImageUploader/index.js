import React from 'react'
import axios from 'axios'

class ImageUploader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      file: null
    }
    this.onFormSubmit = this.onFormSubmit.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  onFormSubmit(e) {
    e.preventDefault()
    const formData = new FormData()
    formData.append('avatar', this.state.file)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    axios.post('/users/me/avatar', formData, config)
      .then((response) => {
        alert('The file is successfully uploaded')
      }).catch((error) => {
      })
  }

  onChange(e) {
    this.setState({ file: e.target.files[0] })
  }

  render() {
    return (
      <form onSubmit={this.onFormSubmit}>
        <h1>File Upload</h1>
        <input type="file" name="myImage" onChange={this.onChange} />
        <button type="submit">Upload</button>
      </form>
    )
  }
}

export default ImageUploader