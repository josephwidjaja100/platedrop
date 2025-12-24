import {
  Html,
  Container,
  Text,
} from '@react-email/components';

type MatchingEmailProps = {
  matchName?: string;
  matchYear?: string;
  matchMajor?: string;
  matchEthnicity?: string[];
  matchGender?: string;
  matchInstagram?: string;
  matchPhoto?: string;
  attractivenessDiff?: number; // This should be on 100 scale
};

export default function MatchingEmail({
  matchName = 'Alex',
  matchYear = 'Junior',
  matchMajor = 'Computer Science',
  matchEthnicity = ['Asian'],
  matchGender = 'Male',
  matchInstagram = 'alex_instagram',
  matchPhoto = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80',
  attractivenessDiff = 5, // Default 5 on 100 scale
}: MatchingEmailProps) {
  // Convert from 100 scale to 10 scale
  const diffOn10Scale = (attractivenessDiff / 10).toFixed(1);
  
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
                        hey... got any matches for me?
                    </div>
                  </td>
                </tr>
              </table>

              {/* User Message 2 - New message (right-aligned) */}
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
                        please make them as attractive as me
                    </div>
                  </td>
                </tr>
              </table>

              {/* Bot Message 1 - Match announcement */}
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
                      🎉 here's your match!
                    </div>
                  </td>
                  <td style={{ width: '25%' }}></td>
                </tr>
              </table>

              {/* Bot Message 2 - Basic info */}
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
                      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                        {matchName}
                      </div>
                      <div style={{ color: '#52525b' }}>
                        {matchEthnicity.join(', ')} • {matchGender}
                      </div>
                      <div style={{ color: '#52525b' }}>
                        {matchYear} • {matchMajor}
                      </div>
                    </div>
                  </td>
                  <td style={{ width: '25%' }}></td>
                </tr>
              </table>

              {/* Bot Message 3 - Attractiveness difference */}
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
                      your attractiveness levels differ by {diffOn10Scale}/10 ✨
                    </div>
                  </td>
                  <td style={{ width: '25%' }}></td>
                </tr>
              </table>

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
                      we wont say who's higher but yk...
                    </div>
                  </td>
                  <td style={{ width: '25%' }}></td>
                </tr>
              </table>

              {/* Bot Message 4 - Instagram */}
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
                      reach out on instagram:
                      <div style={{ marginTop: '4px' }}>
                        <a
                          href={`https://instagram.com/${matchInstagram}`}
                          style={{
                            color: '#2563eb',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                          }}
                        >
                          @{matchInstagram}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td style={{ width: '25%' }}></td>
                </tr>
              </table>

              {/* Bot Message 5 - Photo */}
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
                        padding: '8px',
                        borderRadius: '16px',
                        display: 'inline-block',
                        maxWidth: '75%',
                      }}
                    >
                      <img
                        src={matchPhoto}
                        alt={matchName}
                        style={{
                          width: '200px',
                          height: '200px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ width: '25%' }}></td>
                </tr>
              </table>

              {/* Bot Message 6 - Good luck */}
              <table width="100%" style={{ marginTop: '16px', borderCollapse: 'collapse' }}>
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
                      go say hi! good luck 💫
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
          <a href="https://looksmatr.com" style={{ color: '#6b7280', textDecoration: 'none' }}>
            visit looksmatr.com
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