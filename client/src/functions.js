export function setMessage(type, message) {
  this.setState({
    message: {
      type,
      text: message
    }
  });
}

export function setLoading(value) {
  this.setState({
    loading: value
  });
}
