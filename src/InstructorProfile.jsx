import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from './InstructorProfile.module.css';

const mockInstructor = {
  fullName: 'Dr. Alex Ray',
  email: 'alex.ray@example.com',
  department: 'Computer Science',
  phone: '123-456-7890',
  office: 'Building C, Room 301',
};

const InstructorProfile = ({ theme: propTheme }) => {
  const context = useOutletContext();
  const theme = propTheme || context?.theme;

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(mockInstructor);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile updated:', profile);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div className={`${styles.profileContainer} ${styles[theme]}`}>
      <div className={styles.header}>
        <h2>My Profile</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className={styles.editButton}>
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className={styles.profileForm}>
          <div className={styles.formGroup}>
            <label htmlFor="fullName">Full Name</label>
            <input type="text" id="fullName" name="fullName" value={profile.fullName} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" value={profile.email} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="department">Department</label>
            <input type="text" id="department" name="department" value={profile.department} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone" value={profile.phone} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="office">Office</label>
            <input type="text" id="office" name="office" value={profile.office} onChange={handleChange} />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton}>Save Changes</button>
            <button type="button" onClick={() => setIsEditing(false)} className={styles.cancelButton}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className={styles.profileDetails}>
          <p><strong>Full Name:</strong> {profile.fullName}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Department:</strong> {profile.department}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
          <p><strong>Office:</strong> {profile.office}</p>
        </div>
      )}
    </div>
  );
};

export default InstructorProfile;
