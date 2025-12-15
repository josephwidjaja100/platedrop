import {
  Html,
  Container,
  Heading,
  Section,
  Text,
} from '@react-email/components';

type OtpChatEmailProps = {
  email?: string;
  otpCode?: string;
};

export default function OtpChatEmail({ email = 'user@example.com', otpCode = '652854' }: OtpChatEmailProps) {
  return (
    <Html>
      <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Georgia, "Times New Roman", serif' }}>
        {/* Chat window container */}
        <table
          width="100%"
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #d1d5db',
            borderCollapse: 'separate',
            borderSpacing: '0',
            margin: '0 auto',
            borderRadius: '16px',
          }}
        >
            
          {/* Top bar with window controls */}
          <tr>
            <td style={{ backgroundColor: '#e2e8f0', padding: '8px 12px', borderRadius: '14px 14px 0 0' }}>
              <table width="100%" style={{ borderCollapse: 'collapse' }}>
                <tr>
                  <td style={{ width: '10px', paddingRight: '6px' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#f87171',
                        borderRadius: '50%',
                        display: 'inline-block',
                      }}
                    />
                  </td>
                  <td style={{ width: '10px', paddingRight: '6px' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#fbbf24',
                        borderRadius: '50%',
                        display: 'inline-block',
                      }}
                    />
                  </td>
                  <td style={{ width: '10px' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#4ade80',
                        borderRadius: '50%',
                        display: 'inline-block',
                      }}
                    />
                  </td>
                  <td style={{ width: '100%' }}></td>
                </tr>
              </table>
            </td>
          </tr>

          {/* Header with profile */}
          <tr>
            <td style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #d4d4d8' }}>
              <div
                style={{
                  width: '35px',
                  height: '35px',
                  backgroundColor: '#cbd5e1',
                  borderRadius: '50%',
                  margin: '0 auto 8px',
                }}
              />
              <Text style={{ margin: '0', color: '#94a3b8', fontSize: '14px', fontFamily: 'Georgia, "Times New Roman", serif' }}>
                looksmatr
              </Text>
            </td>
          </tr>

          {/* Chat area */}
          <tr>
            <td style={{ padding: '20px', borderRadius: '0 0 14px 14px' }}>
              <Section>
                {/* User Message (right-aligned) */}
                <table width="100%" style={{ marginBottom: '16px', borderCollapse: 'collapse' }}>
                  <tr>
                    <td style={{ width: '25%' }}></td>
                    <td style={{ width: '75%', textAlign: 'right' }}>
                      <div
                        style={{
                          backgroundColor: '#dbeafe',
                          color: '#000000',
                          fontSize: '14px',
                          padding: '8px 16px',
                          borderRadius: '16px',
                          display: 'inline-block',
                          maxWidth: '75%',
                          fontFamily: 'Georgia, "Times New Roman", serif',
                        }}
                      >
                        hey... can you send me my verification code?
                      </div>
                    </td>
                  </tr>
                </table>

                {/* Bot Message (left-aligned) */}
                <table width="100%" style={{ borderCollapse: 'collapse' }}>
                  <tr>
                    <td style={{ width: '25px', textAlign: 'left', verticalAlign: 'top', paddingRight: '8px' }}>
                      <div
                        style={{
                          width: '25px',
                          height: '25px',
                          backgroundColor: '#cbd5e1',
                          borderRadius: '50%',
                          display: 'inline-block',
                        }}
                      />
                    </td>
                    <td style={{ width: '75%', textAlign: 'left' }}>
                      <div
                        style={{
                          backgroundColor: '#e4e4e7',
                          color: '#000000',
                          fontSize: '14px',
                          padding: '8px 16px',
                          borderRadius: '16px',
                          display: 'inline-block',
                          maxWidth: '75%',
                          fontFamily: 'Georgia, "Times New Roman", serif',
                        }}
                      >
                        here you go!
                        <div
                          style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            marginTop: '4px',
                            letterSpacing: '4px',
                            color: '#27272a',
                            fontFamily: 'Georgia, "Times New Roman", serif',
                          }}
                        >
                          {otpCode}
                        </div>
                      </div>
                    </td>
                    <td style={{ width: '25%' }}></td>
                  </tr>
                </table>
              </Section>
            </td>
          </tr>
        </table>

        {/* Footer */}
        <Text
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '24px',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          if you didn't request this code, you can safely ignore this email.
        </Text>
        <Text
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '2px',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          if this email looks oddly formatted, it's because your email client wasn't able to render it. sorry!
        </Text>
      </Container>
    </Html>
  );
}