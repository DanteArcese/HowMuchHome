// Currency formatter for displaying USD values nicely
const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    trailingZeroDisplay: "stripIfInteger"
});

// Event listener for calculating maximum home price based on available cash
document.getElementById("downPaymentForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Get user inputs and convert to numerical values
    const cashOnHand = parseFloat(document.getElementById("cashOnHand").value);
    const downPaymentPercent = parseFloat(document.getElementById("downPaymentPercent").value) / 100;
    const closingCostPercent = (parseFloat(document.getElementById("closingCostPercent").value) || 0) / 100;

    // Calculate the maximum home price based on available cash
    const maxHomePrice = cashOnHand / (downPaymentPercent + closingCostPercent);

    // Display the result formatted as currency
    document.getElementById("downPaymentResult").innerHTML = currencyFormatter.format(maxHomePrice);
});

/**
 * Calculates the maximum home price affordable based on mortgage payment.
 * 
 * @param {number} monthlyPayment - Target monthly mortgage payment.
 * @param {number} years - Mortgage term in years.
 * @param {number} downPaymentPercent - Down payment as a decimal (e.g., 0.2 for 20%).
 * @param {number} taxRate - Property tax rate as a decimal (e.g., 0.0125 for 1.25%).
 * @param {number} insuranceRate - Home insurance rate as a decimal (e.g., 0.005 for 0.5%).
 * @param {number} interestRate - Loan interest rate as a decimal (e.g., 0.065 for 6.5%).
 * @returns {number} The maximum home price that fits within the monthly budget.
 */
function getHomePrice(monthlyPayment, years, downPaymentPercent, taxRate, insuranceRate, interestRate) {
    const monthlyInterestRate = interestRate / 12;
    const numberOfPayments = years * 12;

    // Function to calculate mortgage payment for a given home price
    function mortgagePayment(homePrice) {
        const loanAmount = homePrice * (1 - downPaymentPercent);
        return (
            loanAmount *
            (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
            (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
        );
    }

    // Function to calculate the total monthly cost, including tax & insurance
    function totalMonthlyCost(homePrice) {
        return (
            mortgagePayment(homePrice) +
            (homePrice * taxRate / 12) +
            (homePrice * insuranceRate / 12)
        );
    }

    // Use binary search to determine the maximum affordable home price
    let low = 0;
    let high = 10_000_000; // Arbitrary high value
    let mid;

    while (high - low > 0.01) { // Precision up to cents
        mid = (low + high) / 2;
        if (totalMonthlyCost(mid) > monthlyPayment) {
            high = mid;
        } else {
            low = mid;
        }
    }

    return mid;
}

// Event listener for calculating home affordability based on monthly payment
document.getElementById("monthlyPaymentForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Get user inputs and convert them to numerical values
    const monthlyPaymentAmount = parseFloat(document.getElementById("monthlyPaymentAmount").value);
    const monthlyPaymentYears = parseFloat(document.getElementById("monthlyPaymentYears").value);
    const monthlyPaymentDownPayment = parseFloat(document.getElementById("monthlyPaymentDownPayment").value) / 100;
    const monthlyPaymentTaxRate = (parseFloat(document.getElementById("monthlyPaymentTaxRate").value) || 0) / 100;
    const monthlyPaymentInsuranceRate = (parseFloat(document.getElementById("monthlyPaymentInsuranceRate").value) || 0) / 100;
    const monthlyPaymentInterestRate = parseFloat(document.getElementById("monthlyPaymentInterestRate").value) / 100;

    // Calculate the maximum home price and display the formatted result
    const maxHomePrice = getHomePrice(
        monthlyPaymentAmount,
        monthlyPaymentYears,
        monthlyPaymentDownPayment,
        monthlyPaymentTaxRate,
        monthlyPaymentInsuranceRate,
        monthlyPaymentInterestRate
    );

    document.getElementById("monthlyPaymentResult").innerHTML = currencyFormatter.format(maxHomePrice);
});