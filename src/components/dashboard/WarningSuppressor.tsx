import React, { Component, ErrorInfo, ReactNode } from 'react';

class WarningSuppressor extends Component<{ children: ReactNode }> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (error.message.includes('defaultProps')) {
      // Suppress the warning
      return;
    }
    // Re-throw other errors
    throw error;
  }

  render() {
    return this.props.children;
  }
}

export default WarningSuppressor;