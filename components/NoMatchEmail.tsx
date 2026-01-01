import {
  Html,
  Container,
  Text,
} from '@react-email/components';

type NoMatchEmailProps = {
  name?: string;
};

export default function NoMatchEmail({ name = 'there' }: NoMatchEmailProps = {}) {
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
                likely
              </Text>
            </td>
          </tr>

          {/* Chat area */}
          <tr>
            <td style={{ padding: '20px', borderRadius: '0 0 14px 14px' }}>
              
              {/* User Message 1 (right-aligned) */}
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
                        hey... got a match?
                    </div>
                  </td>
                </tr>
              </table>

              {/* Bot Message 1 - Sorry message */}
              <table width="100%" style={{ marginBottom: '16px', borderCollapse: 'collapse' }}>
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
                      unfortunately not, {name} :(
                    </div>
                  </td>
                  <td style={{ width: '25%' }}></td>
                </tr>
              </table>

              {/* Bot Message 2 - Explanation */}
              <table width="100%" style={{ marginBottom: '16px', borderCollapse: 'collapse' }}>
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
                      we couldn't find anyone that fits your preferences <em>and</em> is as attractive as you
                    </div>
                  </td>
                  <td style={{ width: '25%' }}></td>
                </tr>
              </table>

              {/* Bot Message 3 - Encouragement */}
              <table width="100%" style={{ marginBottom: '16px', borderCollapse: 'collapse' }}>
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
                      don't worry, we'll try again in the next matching round!
                    </div>
                  </td>
                  <td style={{ width: '25%' }}></td>
                </tr>
              </table>

              {/* Bot Message 4 - Suggestions */}
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
                      consider broadening your preferences for better chances! 
                    </div>
                  </td>
                  <td style={{ width: '25%' }}></td>
                </tr>
              </table>
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
          <a href="https://likely.one" style={{ color: '#6b7280', textDecoration: 'none' }}>
            visit likely.one
          </a>
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