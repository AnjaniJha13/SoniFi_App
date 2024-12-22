document.getElementById('transactionForm').addEventListener('submit', async event => {
    event.preventDefault();
  
    const email = document.getElementById('email').value;
    const tableBody = document.querySelector('#transactionTable tbody');
    tableBody.innerHTML = ''; // Clear previous data
  
    try {
      // Fetch transaction data
      const response = await fetch(`http://localhost:5000/api/transactions?email=${email}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transaction history');
      }
  
      const transactions = await response.json();
  
      // Populate the table
      transactions.forEach(tx => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${tx.transaction_id}</td>
          <td>${tx.sender_name}</td>
          <td>${tx.receiver_name}</td>
          <td>${tx.amount}</td>
          <td>${new Date(tx.transaction_date).toLocaleString()}</td>
        `;
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Unable to fetch transaction history. Please try again.');
    }
  });
  