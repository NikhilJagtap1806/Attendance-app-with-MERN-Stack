  // Function to toggle teacher-specific fields based on selected role
  function toggleTeacherFields() {
    const roleSelect = document.getElementById('role');
    const teacherFields = document.getElementById('teacherFields');

    if (roleSelect.value === 'teacher') {
      teacherFields.style.display = 'block';
    } else {
      teacherFields.style.display = 'none';
    }
  }

  // Attach the function to the change event of the role select
  document.getElementById('role').addEventListener('change', toggleTeacherFields);

  // Initial call to set the initial state
  toggleTeacherFields();