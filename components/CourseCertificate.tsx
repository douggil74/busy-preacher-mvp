// components/CourseCertificate.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  completionDate: string;
  totalLessons: number;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  border: {
    border: '4pt solid #2c5f2d',
    padding: 40,
    height: '100%',
  },
  innerBorder: {
    border: '1pt solid #2c5f2d',
    padding: 30,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    marginBottom: 20,
    color: '#2c5f2d',
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: '#555',
    textAlign: 'center',
  },
  presentedTo: {
    fontSize: 14,
    marginBottom: 10,
    color: '#666',
    textAlign: 'center',
  },
  name: {
    fontSize: 32,
    marginBottom: 30,
    color: '#2c5f2d',
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    borderBottom: '2pt solid #2c5f2d',
    paddingBottom: 10,
    width: '60%',
  },
  completion: {
    fontSize: 14,
    marginBottom: 40,
    color: '#666',
    textAlign: 'center',
    lineHeight: 1.6,
  },
  scripture: {
    fontSize: 12,
    marginTop: 40,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    width: '80%',
  },
  date: {
    fontSize: 12,
    marginTop: 30,
    color: '#666',
    textAlign: 'center',
  },
  logo: {
    fontSize: 24,
    marginBottom: 10,
    color: '#2c5f2d',
    textAlign: 'center',
  }
});

const CertificateDocument: React.FC<CertificateProps> = ({ 
  studentName, 
  courseTitle, 
  completionDate,
  totalLessons 
}) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.border}>
        <View style={styles.innerBorder}>
          <Text style={styles.logo}>✝</Text>
          <Text style={styles.title}>Certificate of Completion</Text>
          <Text style={styles.subtitle}>The Busy Christian Bible Study</Text>
          
          <Text style={styles.presentedTo}>This certificate is presented to</Text>
          <Text style={styles.name}>{studentName}</Text>
          
          <Text style={styles.completion}>
            For successfully completing the course{'\n'}
            "{courseTitle}"{'\n'}
            consisting of {totalLessons} comprehensive lessons
          </Text>
          
          <Text style={styles.scripture}>
            "Study to shew thyself approved unto God, a workman that needeth not{'\n'}
            to be ashamed, rightly dividing the word of truth." - 2 Timothy 2:15
          </Text>
          
          <Text style={styles.date}>Completed on {completionDate}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default CertificateDocument;

// Helper function to generate and download the PDF
export const downloadCertificate = async (props: CertificateProps) => {
  const blob = await pdf(<CertificateDocument {...props} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${props.courseTitle.replace(/\s+/g, '_')}_Certificate.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};