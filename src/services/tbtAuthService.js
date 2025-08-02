export class TBTAuthService {
  /**
   * Load approved emails from CSV file
   */
  static async loadApprovedEmails() {
    try {
      // Try multiple possible paths for the CSV file
      let response;
      const possiblePaths = [
        '/tbt-approved-emails.csv',
        './tbt-approved-emails.csv',
        '/public/tbt-approved-emails.csv'
      ];
      
      // Add cache-busting parameter for development
      const isDevelopment = import.meta.env.DEV;
      const cacheBuster = isDevelopment ? `?t=${Date.now()}` : '';
      
      for (const path of possiblePaths) {
        try {
          const fullPath = path + cacheBuster;
          
          // Create a timeout promise
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 5000);
          });
          
          // Create the fetch promise
          const fetchPromise = fetch(fullPath, {
            method: 'GET',
            headers: {
              'Accept': 'text/csv,text/plain,*/*',
              'Cache-Control': 'no-cache'
            }
          });
          
          // Race between fetch and timeout
          response = await Promise.race([fetchPromise, timeoutPromise]);
          
          if (response.ok) {
            break;
          }
        } catch (e) {
          // Silently continue to next path
        }
      }
      
      if (!response || !response.ok) {
        // Fallback to hardcoded emails for development
        return [
          { email: 'b4bodkhe@gmail.com', status: 'approved', date: '2024-01-15' },
          { email: 'student1@tbt.edu', status: 'approved', date: '2024-01-15' },
          { email: 'student2@tbt.edu', status: 'approved', date: '2024-01-15' },
          { email: 'instructor@tbt.edu', status: 'approved', date: '2024-01-15' }
        ];
      }
      
      const csvText = await response.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      
      // Skip header if present
      const dataLines = lines[0].includes('email') ? lines.slice(1) : lines;
      
      const approvedEmails = dataLines.map(line => {
        const [email, status, addedDate] = line.split(',').map(field => field.trim());
        return { email, status, date: addedDate };
      }).filter(entry => entry.status === 'approved');
      
      return approvedEmails;
    } catch (error) {
      console.error('Error loading approved emails:', error);
      // Fallback to hardcoded emails for development
      return [
        { email: 'b4bodkhe@gmail.com', status: 'approved', date: '2024-01-15' },
        { email: 'student1@tbt.edu', status: 'approved', date: '2024-01-15' },
        { email: 'student2@tbt.edu', status: 'approved', date: '2024-01-15' },
        { email: 'instructor@tbt.edu', status: 'approved', date: '2024-01-15' }
      ];
    }
  }

  /**
   * Check if email is approved for TBT access
   */
  static async checkEmailStatus(email) {
    try {
      const approvedEmails = await this.loadApprovedEmails();
      const isApproved = approvedEmails.some(entry => 
        entry.email.toLowerCase() === email.toLowerCase()
      );
      
      return {
        isApproved,
        status: isApproved ? 'tbt' : 'guest',
        accessLevel: isApproved ? 'tbt' : 'guest'
      };
    } catch (error) {
      // Silently fall back to guest access
      return {
        isApproved: false,
        status: 'guest',
        accessLevel: 'guest'
      };
    }
  }

  /**
   * Get TBT authentication status for a user
   */
  static async getTBTAuthStatus(userEmail) {
    if (!userEmail) {
      return {
        tbtAuthStatus: 'guest',
        accessLevel: 'guest',
        isApproved: false
      };
    }

    const emailStatus = await this.checkEmailStatus(userEmail);
    
    return {
      tbtAuthStatus: emailStatus.status,
      accessLevel: emailStatus.accessLevel,
      isApproved: emailStatus.isApproved
    };
  }
} 