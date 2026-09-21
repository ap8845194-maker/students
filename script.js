/* ==========================================
   STUDENT FINANCE AI V2
   COMPLETE SCRIPT
========================================== */


/* ==========================================
   DATA
========================================== */

let expenses = JSON.parse(
    localStorage.getItem("studentExpenses")
) || [];

let financeData = JSON.parse(
    localStorage.getItem("studentFinance")
) || {
    income: 0,
    budget: 0,
    goal: 0
};


/* ==========================================
   ELEMENTS
========================================== */

const navItems =
    document.querySelectorAll(".nav-item");

const sections =
    document.querySelectorAll(".section");

const expenseModal =
    document.getElementById("expenseModal");

const expenseForm =
    document.getElementById("expenseForm");

const toast =
    document.getElementById("toast");

const toastText =
    document.getElementById("toastText");

const currentDate =
    document.getElementById("currentDate");


/* ==========================================
   DATE
========================================== */

function setCurrentDate() {

    if (!currentDate) return;

    const date = new Date();

    currentDate.textContent =
        date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
}

setCurrentDate();


/* ==========================================
   NAVIGATION
========================================== */

navItems.forEach(item => {

    item.addEventListener("click", () => {

        const sectionName =
            item.dataset.section;

        navItems.forEach(nav => {
            nav.classList.remove("active");
        });

        item.classList.add("active");

        sections.forEach(section => {
            section.classList.remove(
                "active-section"
            );
        });

        const target =
            document.getElementById(sectionName);

        if (target) {
            target.classList.add(
                "active-section"
            );
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

});


/* ==========================================
   GO BUTTONS
========================================== */

document
    .querySelectorAll("[data-go]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const target =
                    button.dataset.go;

                document
                    .querySelector(
                        `[data-section="${target}"]`
                    )
                    ?.click();

            }
        );

    });


/* ==========================================
   STORAGE
========================================== */

function saveData() {

    localStorage.setItem(
        "studentExpenses",
        JSON.stringify(expenses)
    );

    localStorage.setItem(
        "studentFinance",
        JSON.stringify(financeData)
    );

}


/* ==========================================
   CURRENCY
========================================== */

function money(amount) {

    return "₹" +
        Number(amount || 0)
            .toLocaleString("en-IN");

}


/* ==========================================
   TOTAL EXPENSES
========================================== */

function getTotalExpenses() {

    return expenses.reduce(
        (total, expense) => {

            return total +
                Number(expense.amount || 0);

        },
        0
    );

}


/* ==========================================
   REMAINING INCOME
========================================== */

function getRemainingIncome() {

    const income =
        Number(financeData.income || 0);

    const spent =
        getTotalExpenses();

    return Math.max(
        income - spent,
        0
    );

}


/* ==========================================
   DASHBOARD
========================================== */

function updateDashboard() {

    const total =
        getTotalExpenses();

    const income =
        Number(
            financeData.income || 0
        );

    const savings =
        Math.max(
            income - total,
            0
        );

    const incomeStat =
        document.getElementById("incomeStat");

    const expenseStat =
        document.getElementById("expenseStat");

    const savingsStat =
        document.getElementById("savingsStat");

    const scoreStat =
        document.getElementById("scoreStat");

    if (incomeStat) {
        incomeStat.textContent =
            money(income);
    }

    if (expenseStat) {
        expenseStat.textContent =
            money(total);
    }

    if (savingsStat) {
        savingsStat.textContent =
            money(savings);
    }

    const score =
        calculateFinanceScore();

    if (scoreStat) {
        scoreStat.textContent =
            score + "/100";
    }

    updateBreakdown();
    updateGoal();
    updateRecentExpenses();
    updateExpensePage();
    updateBudgetPage();

}


/* ==========================================
   FINANCE SCORE
========================================== */

function calculateFinanceScore() {

    const income =
        Number(
            financeData.income || 0
        );

    const total =
        getTotalExpenses();

    if (income <= 0) {

        if (total === 0) {
            return 0;
        }

        return 25;
    }

    const savings =
        income - total;

    let score = 50;

    if (savings > 0) {

        const savingRate =
            savings / income;

        score +=
            Math.min(
                savingRate * 100,
                30
            );

    } else {

        score -= 20;

    }

    if (
        financeData.budget > 0 &&
        total <= financeData.budget
    ) {

        score += 15;

    } else if (
        financeData.budget > 0
    ) {

        score -= 10;

    }

    if (expenses.length > 0) {
        score += 5;
    }

    return Math.max(
        0,
        Math.min(
            100,
            Math.round(score)
        )
    );

}


/* ==========================================
   BREAKDOWN
========================================== */

function updateBreakdown() {

    const container =
        document.getElementById(
            "expenseBreakdown"
        );

    if (!container) return;

    if (expenses.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No expenses added yet.
            </div>
        `;

        return;
    }

    const categories = {};

    expenses.forEach(expense => {

        const category =
            expense.category;

        categories[category] =
            (
                categories[category] || 0
            ) +
            Number(expense.amount || 0);

    });

    const total =
        getTotalExpenses();

    const icons = {

        Food: "🍔",
        Education: "📚",
        Travel: "🚌",
        Entertainment: "🎮",
        Shopping: "🛍️",
        Bills: "💡",
        Other: "📦"

    };

    const sorted =
        Object.entries(categories)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );

    container.innerHTML =
        sorted
            .map(
                ([category, amount]) => {

                    const percentage =
                        total > 0
                            ? Math.round(
                                (
                                    amount /
                                    total
                                ) * 100
                            )
                            : 0;

                    return `

                        <div class="breakdown-item">

                            <div class="breakdown-top">

                                <span>

                                    <span class="category-icon">

                                        ${
                                            icons[category]
                                            || "📦"
                                        }

                                    </span>

                                    ${
                                        escapeHTML(
                                            category
                                        )
                                    }

                                </span>

                                <span>

                                    ${
                                        money(
                                            amount
                                        )
                                    }

                                </span>

                            </div>

                            <div class="mini-progress">

                                <div
                                    style="width:${percentage}%"
                                ></div>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* ==========================================
   RECENT EXPENSES
========================================== */

function updateRecentExpenses() {

    const tbody =
        document.getElementById(
            "recentExpenses"
        );

    if (!tbody) return;

    const recent =
        [...expenses]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 5);

    if (recent.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="empty-table"
                >
                    No expenses yet.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML =
        recent
            .map(expense => {

                return `

                    <tr>

                        <td>

                            <strong>

                                ${
                                    escapeHTML(
                                        expense.name
                                    )
                                }

                            </strong>

                        </td>

                        <td>

                            <span class="category-pill">

                                ${
                                    escapeHTML(
                                        expense.category
                                    )
                                }

                            </span>

                        </td>

                        <td>

                            ${
                                formatDate(
                                    expense.date
                                )
                            }

                        </td>

                        <td>

                            ${
                                money(
                                    expense.amount
                                )
                            }

                        </td>

                    </tr>

                `;

            })
            .join("");

}


/* ==========================================
   EXPENSE PAGE
========================================== */

function updateExpensePage() {

    const tbody =
        document.getElementById(
            "expenseTable"
        );

    if (!tbody) return;

    const total =
        getTotalExpenses();

    const expensePageTotal =
        document.getElementById(
            "expensePageTotal"
        );

    const transactionCount =
        document.getElementById(
            "transactionCount"
        );

    const averageExpense =
        document.getElementById(
            "averageExpense"
        );

    if (expensePageTotal) {
        expensePageTotal.textContent =
            money(total);
    }

    if (transactionCount) {
        transactionCount.textContent =
            expenses.length;
    }

    const average =
        expenses.length
            ? total / expenses.length
            : 0;

    if (averageExpense) {
        averageExpense.textContent =
            money(
                Math.round(average)
            );
    }

    if (expenses.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="empty-table"
                >
                    No expenses added.
                </td>
            </tr>
        `;

        return;
    }

    const sorted =
        [...expenses]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );

    tbody.innerHTML =
        sorted
            .map(expense => {

                return `

                    <tr>

                        <td>

                            <strong>

                                ${
                                    escapeHTML(
                                        expense.name
                                    )
                                }

                            </strong>

                        </td>

                        <td>

                            <span class="category-pill">

                                ${
                                    escapeHTML(
                                        expense.category
                                    )
                                }

                            </span>

                        </td>

                        <td>

                            ${
                                formatDate(
                                    expense.date
                                )
                            }

                        </td>

                        <td>

                            ${
                                money(
                                    expense.amount
                                )
                            }

                        </td>

                        <td>

                            <button
                                class="delete-expense"
                                onclick="deleteExpense('${expense.id}')"
                            >
                                ×
                            </button>

                        </td>

                    </tr>

                `;

            })
            .join("");

}


/* ==========================================
   EXPENSE MODAL
========================================== */

const openExpenseModal =
    document.getElementById(
        "openExpenseModal"
    );

const closeExpenseModal =
    document.getElementById(
        "closeExpenseModal"
    );

if (openExpenseModal) {

    openExpenseModal.addEventListener(
        "click",
        () => {

            const dateInput =
                document.getElementById(
                    "expenseDate"
                );

            if (dateInput) {

                dateInput.value =
                    new Date()
                        .toISOString()
                        .split("T")[0];

            }

            expenseModal?.classList.add(
                "show"
            );

        }
    );

}

if (closeExpenseModal) {

    closeExpenseModal.addEventListener(
        "click",
        () => {

            expenseModal?.classList.remove(
                "show"
            );

        }
    );

}

if (expenseModal) {

    expenseModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                expenseModal
            ) {

                expenseModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* ==========================================
   ADD EXPENSE
   INCOME LIMIT ENABLED
========================================== */

if (expenseForm) {

    expenseForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const name =
                document
                    .getElementById("expenseName")
                    .value
                    .trim();

            const amount =
                Number(
                    document
                        .getElementById("expenseAmount")
                        .value
                );

            const category =
                document
                    .getElementById("expenseCategory")
                    .value;

            const date =
                document
                    .getElementById("expenseDate")
                    .value;

            if (
                !name ||
                amount <= 0 ||
                !category ||
                !date
            ) {

                showToast(
                    "Please fill all fields",
                    "⚠️"
                );

                return;
            }

            const income =
                Number(
                    financeData.income || 0
                );

            const currentExpenses =
                getTotalExpenses();

            const totalAfterExpense =
                currentExpenses +
                amount;

            if (income <= 0) {

                showToast(
                    "Please set Monthly Income first",
                    "⚠️"
                );

                alert(
                    "⚠️ Please set your Monthly Income first."
                );

                return;
            }

            if (
                totalAfterExpense >
                income
            ) {

                const remaining =
                    Math.max(
                        income -
                        currentExpenses,
                        0
                    );

                showToast(
                    `Expense blocked! Only ${money(
                        remaining
                    )} remaining.`,
                    "🚫"
                );

                alert(

                    "🚫 EXPENSE BLOCKED\n\n" +

                    "Monthly Income: " +
                    money(income) +

                    "\nCurrent Expenses: " +
                    money(currentExpenses) +

                    "\nThis Expense: " +
                    money(amount) +

                    "\n\nRemaining Amount: " +
                    money(remaining) +

                    "\n\nYou cannot spend more than your monthly income."

                );

                return;
            }

            expenses.push({

                id:
                    Date.now().toString(),

                name,
                amount,
                category,
                date

            });

            saveData();

            expenseForm.reset();

            expenseModal?.classList.remove(
                "show"
            );

            updateDashboard();

            showToast(
                "Expense added successfully",
                "✓"
            );

        }
    );

}


/* ==========================================
   DELETE EXPENSE
========================================== */

function deleteExpense(id) {

    const confirmed =
        confirm(
            "Delete this expense?"
        );

    if (!confirmed) return;

    expenses =
        expenses.filter(
            expense =>
                expense.id !== id
        );

    saveData();

    updateDashboard();

    showToast(
        "Expense deleted",
        "🗑️"
    );

}


/* ==========================================
   BUDGET SAVE
========================================== */

const saveBudgetBtn =
    document.getElementById(
        "saveBudgetBtn"
    );

if (saveBudgetBtn) {

    saveBudgetBtn.addEventListener(
        "click",
        () => {

            const income =
                Number(
                    document
                        .getElementById(
                            "incomeInput"
                        )
                        .value
                );

            const budget =
                Number(
                    document
                        .getElementById(
                            "budgetInput"
                        )
                        .value
                );

            const goal =
                Number(
                    document
                        .getElementById(
                            "goalInput"
                        )
                        .value
                );

            if (income <= 0) {

                showToast(
                    "Enter a valid monthly income",
                    "⚠️"
                );

                return;
            }

            if (budget > income) {

                showToast(
                    "Budget cannot be higher than income",
                    "🚫"
                );

                alert(

                    "🚫 INVALID BUDGET\n\n" +

                    "Monthly Income: " +
                    money(income) +

                    "\nMonthly Budget: " +
                    money(budget) +

                    "\n\nYour budget cannot be higher than your monthly income."

                );

                return;
            }

            const totalExpenses =
                getTotalExpenses();

            if (
                totalExpenses >
                income
            ) {

                showToast(
                    "Income is already below your expenses",
                    "🚫"
                );

                alert(

                    "🚫 INVALID INCOME\n\n" +

                    "Current Expenses: " +
                    money(totalExpenses) +

                    "\nNew Income: " +
                    money(income) +

                    "\n\nIncome cannot be lower than your existing expenses."

                );

                return;
            }

            financeData.income =
                Math.max(
                    0,
                    income
                );

            financeData.budget =
                Math.max(
                    0,
                    budget
                );

            financeData.goal =
                Math.max(
                    0,
                    goal
                );

            saveData();

            updateDashboard();

            showToast(
                "Budget saved successfully",
                "✓"
            );

        }
    );

}


/* ==========================================
   UPDATE BUDGET PAGE
========================================== */

function updateBudgetPage() {

    const incomeInput =
        document.getElementById(
            "incomeInput"
        );

    const budgetInput =
        document.getElementById(
            "budgetInput"
        );

    const goalInput =
        document.getElementById(
            "goalInput"
        );

    if (incomeInput) {
        incomeInput.value =
            financeData.income || "";
    }

    if (budgetInput) {
        budgetInput.value =
            financeData.budget || "";
    }

    if (goalInput) {
        goalInput.value =
            financeData.goal || "";
    }

    const spent =
        getTotalExpenses();

    const limit =
        Number(
            financeData.budget || 0
        );

    const remaining =
        Math.max(
            limit - spent,
            0
        );

    const budgetSpent =
        document.getElementById(
            "budgetSpent"
        );

    const budgetLimit =
        document.getElementById(
            "budgetLimit"
        );

    const budgetRemaining =
        document.getElementById(
            "budgetRemaining"
        );

    if (budgetSpent) {
        budgetSpent.textContent =
            money(spent);
    }

    if (budgetLimit) {
        budgetLimit.textContent =
            money(limit);
    }

    if (budgetRemaining) {
        budgetRemaining.textContent =
            money(remaining);
    }

    let percentage = 0;

    if (limit > 0) {

        percentage =
            Math.min(
                (spent / limit) * 100,
                100
            );

    }

    const budgetProgress =
        document.getElementById(
            "budgetProgress"
        );

    if (budgetProgress) {

        budgetProgress.style.width =
            percentage + "%";

    }

    const message =
        document.getElementById(
            "budgetMessage"
        );

    if (!message) return;

    if (limit === 0) {

        message.textContent =
            "Set a monthly budget to start tracking your spending.";

    } else if (
        spent > limit
    ) {

        message.textContent =
            `⚠️ You are ${money(
                spent - limit
            )} over your monthly budget.`;

    } else if (
        percentage >= 80
    ) {

        message.textContent =
            "⚠️ You have used more than 80% of your budget. Spend carefully.";

    } else {

        message.textContent =
            "✓ Your spending is currently within your budget.";

    }

}


/* ==========================================
   SAVINGS GOAL
========================================== */

function updateGoal() {

    const target =
        Number(
            financeData.goal || 0
        );

    const income =
        Number(
            financeData.income || 0
        );

    const totalExpenses =
        getTotalExpenses();

    const saved =
        Math.max(
            income -
            totalExpenses,
            0
        );

    const goalTarget =
        document.getElementById(
            "goalTarget"
        );

    const goalSaved =
        document.getElementById(
            "goalSaved"
        );

    const goalRemaining =
        document.getElementById(
            "goalRemaining"
        );

    if (goalTarget) {
        goalTarget.textContent =
            money(target);
    }

    if (goalSaved) {
        goalSaved.textContent =
            money(saved);
    }

    const remaining =
        Math.max(
            target - saved,
            0
        );

    if (goalRemaining) {
        goalRemaining.textContent =
            money(remaining) +
            " remaining";
    }

    let percentage = 0;

    if (target > 0) {

        percentage =
            Math.min(
                (saved / target) * 100,
                100
            );

    }

    const goalPercent =
        document.getElementById(
            "goalPercent"
        );

    const goalProgress =
        document.getElementById(
            "goalProgress"
        );

    if (goalPercent) {

        goalPercent.textContent =
            Math.round(
                percentage
            ) + "%";

    }

    if (goalProgress) {

        goalProgress.style.width =
            percentage + "%";

    }

}


/* ==========================================
   SET GOAL
========================================== */

const setGoalBtn =
    document.getElementById(
        "setGoalBtn"
    );

if (setGoalBtn) {

    setGoalBtn.addEventListener(
        "click",
        () => {

            const budgetNav =
                document.querySelector(
                    '[data-section="budget"]'
                );

            if (budgetNav) {
                budgetNav.click();
            }

            setTimeout(
                () => {

                    const goalInput =
                        document.getElementById(
                            "goalInput"
                        );

                    if (goalInput) {
                        goalInput.focus();
                    }

                },
                200
            );

        }
    );

}


/* ==========================================
   AI ANALYSIS
========================================== */

const analyzeBtn =
    document.getElementById(
        "analyzeBtn"
    );

if (analyzeBtn) {

    analyzeBtn.addEventListener(
        "click",
        analyzeFinances
    );

}

function analyzeFinances() {

    const income =
        Number(
            financeData.income || 0
        );

    const total =
        getTotalExpenses();

    const savings =
        income - total;

    const score =
        calculateFinanceScore();

    let messages = [];

    let insights = [];

    if (income === 0) {

        messages.push(
            "First, add your monthly income in the Budget section so I can analyze your finances more accurately."
        );

        insights.push({

            type: "warning",

            text:
                "Monthly income has not been added yet."

        });

    } else {

        const savingRate =
            (savings / income) * 100;

        if (savings > 0) {

            messages.push(

                `You currently have approximately ${
                    money(savings)
                } left after your recorded expenses.`

            );

            insights.push({

                type: "good",

                text:
                    `Your current estimated savings are ${
                        money(savings)
                    }.`

            });

        } else {

            messages.push(
                "Your recorded expenses are equal to or higher than your monthly income."
            );

            insights.push({

                type: "danger",

                text:
                    "Your current spending is leaving little or no room for savings."

            });

        }

        if (savingRate >= 20) {

            messages.push(

                `Your estimated saving rate is ${
                    Math.round(
                        savingRate
                    )
                }%. That's a healthy starting point for a student budget.`

            );

        } else if (
            savingRate > 0
        ) {

            messages.push(

                `Your estimated saving rate is ${
                    Math.round(
                        savingRate
                    )
                }%. Look for one or two expenses you can reduce.`

            );

            insights.push({

                type: "warning",

                text:
                    "Try increasing your savings rate gradually."

            });

        }

        if (
            financeData.budget > 0 &&
            total > financeData.budget
        ) {

            messages.push(

                `You are currently ${
                    money(
                        total -
                        financeData.budget
                    )
                } above your monthly budget.`

            );

            insights.push({

                type: "danger",

                text:
                    "Your expenses have crossed your monthly budget."

            });

        }

        const categories =
            getCategoryTotals();

        const biggest =
            Object.entries(categories)
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )[0];

        if (biggest) {

            messages.push(

                `Your biggest spending category is ${
                    biggest[0]
                } at ${
                    money(biggest[1])
                }.`

            );

            insights.push({

                type: "warning",

                text:
                    `${biggest[0]} is currently your largest expense category.`

            });

        }

        if (
            financeData.goal > 0 &&
            savings > 0
        ) {

            const months =
                Math.ceil(
                    financeData.goal /
                    savings
                );

            messages.push(

                `If your current monthly savings continued, your ${
                    money(
                        financeData.goal
                    )
                } goal could take roughly ${
                    months
                } month${
                    months === 1
                        ? ""
                        : "s"
                }.`

            );

        }

    }

    showAIResponse(
        messages.join(" ")
    );

    updateAIScore(score);

    updateInsights(
        insights
    );

}


/* ==========================================
   CATEGORY TOTALS
========================================== */

function getCategoryTotals() {

    const categories = {};

    expenses.forEach(expense => {

        categories[
            expense.category
        ] =
            (
                categories[
                    expense.category
                ] || 0
            ) +
            Number(
                expense.amount || 0
            );

    });

    return categories;

}


/* ==========================================
   AI MESSAGE
========================================== */

function showAIResponse(text) {

    const messages =
        document.getElementById(
            "aiMessages"
        );

    if (!messages) return;

    const div =
        document.createElement(
            "div"
        );

    div.className =
        "message ai";

    div.innerHTML = `

        <div class="message-avatar">
            🤖
        </div>

        <div>

            <strong>
                Finance AI
            </strong>

            <p>
                ${
                    escapeHTML(text)
                }
            </p>

        </div>

    `;

    messages.appendChild(div);

    messages.scrollTop =
        messages.scrollHeight;

}


/* ==========================================
   AI SCORE
========================================== */

function updateAIScore(score) {

    const aiScore =
        document.getElementById(
            "aiScore"
        );

    const scoreLabel =
        document.getElementById(
            "scoreLabel"
        );

    if (aiScore) {
        aiScore.textContent =
            score;
    }

    let label =
        "Needs attention";

    if (score >= 80) {

        label =
            "Excellent financial habits";

    } else if (
        score >= 65
    ) {

        label =
            "Good financial health";

    } else if (
        score >= 45
    ) {

        label =
            "Room for improvement";

    }

    if (scoreLabel) {
        scoreLabel.textContent =
            label;
    }

    const ring =
        document.querySelector(
            ".score-ring"
        );

    if (!ring) return;

    const degrees =
        score * 3.6;

    ring.style.background =
        `conic-gradient(
            var(--primary)
            ${degrees}deg,
            #eeeeF3
            ${degrees}deg
        )`;

}


/* ==========================================
   INSIGHTS
========================================== */

function updateInsights(insights) {

    const container =
        document.getElementById(
            "aiInsights"
        );

    if (!container) return;

    if (
        insights.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                Add your income and expenses
                for personalized insights.

            </div>

        `;

        return;

    }

    container.innerHTML =
        insights
            .map(item => {

                return `

                    <div
                        class="insight ${
                            escapeHTML(
                                item.type
                            )
                        }"
                    >

                        ${
                            escapeHTML(
                                item.text
                            )
                        }

                    </div>

                `;

            })
            .join("");

}


/* ==========================================
   QUICK QUESTIONS
========================================== */

document
    .querySelectorAll(
        ".quick-buttons button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const question =
                    button.dataset.question;

                answerQuickQuestion(
                    question
                );

            }
        );

    });


function answerQuickQuestion(question) {

    const income =
        Number(
            financeData.income || 0
        );

    const total =
        getTotalExpenses();

    const savings =
        income - total;

    let answer = "";

    if (
        question.includes(
            "save more"
        )
    ) {

        answer =
            "Start by identifying your biggest spending category. Try reducing one non-essential expense and move the saved amount toward your savings goal.";

    } else if (
        question.includes(
            "spending too much"
        )
    ) {

        if (income <= 0) {

            answer =
                "Add your monthly income first. Then I can compare your expenses with your available money.";

        } else {

            const rate =
                (total / income) *
                100;

            answer =
                `Your recorded expenses use about ${
                    Math.round(rate)
                }% of your monthly income. Review your biggest categories to see where adjustments are possible.`;

        }

    } else if (
        question.includes(
            "budget plan"
        )
    ) {

        answer =
            "A simple student budget can start with essential expenses first, then savings, and finally discretionary spending. Adjust the percentages based on your actual needs.";

    } else if (
        question.includes(
            "How much should I save"
        )
    ) {

        if (income > 0) {

            answer =
                `Based on your current income of ${
                    money(income)
                }, you could start by targeting around 10–20% if your essential expenses allow it. Your current estimated savings are ${
                    money(
                        Math.max(
                            savings,
                            0
                        )
                    )
                }.`;

        } else {

            answer =
                "Add your monthly income first, then I can calculate a practical savings target.";

        }

    }

    showAIResponse(
        answer
    );

}


/* ==========================================
   DARK MODE
========================================== */

const themeBtn =
    document.getElementById(
        "themeBtn"
    );

if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark"
            );

            const dark =
                document.body.classList.contains(
                    "dark"
                );

            localStorage.setItem(
                "financeDarkMode",
                dark
            );

            themeBtn.textContent =
                dark
                    ? "☀️"
                    : "🌙";

        }
    );

}

if (
    localStorage.getItem(
        "financeDarkMode"
    ) === "true"
) {

    document.body.classList.add(
        "dark"
    );

    if (themeBtn) {

        themeBtn.textContent =
            "☀️";

    }

}


/* ==========================================
   CLEAR DATA
========================================== */

const clearDataBtn =
    document.getElementById(
        "clearDataBtn"
    );

if (clearDataBtn) {

    clearDataBtn.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Are you sure you want to delete all finance data?"
                );

            if (!confirmed) return;

            expenses = [];

            financeData = {

                income: 0,
                budget: 0,
                goal: 0

            };

            localStorage.removeItem(
                "studentExpenses"
            );

            localStorage.removeItem(
                "studentFinance"
            );

            updateDashboard();

            showToast(
                "All data cleared",
                "🗑️"
            );

        }
    );

}


/* ==========================================
   TOAST
========================================== */

function showToast(
    message,
    icon = "✓"
) {

    const toastIcon =
        document.getElementById(
            "toastIcon"
        );

    if (toastIcon) {

        toastIcon.textContent =
            icon;

    }

    if (toastText) {

        toastText.textContent =
            message;

    }

    if (toast) {

        toast.classList.add(
            "show"
        );

        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

    }

}


/* ==========================================
   DATE FORMAT
========================================== */

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date =
        new Date(
            dateString +
            "T00:00:00"
        );

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* ==========================================
   SECURITY / HTML ESCAPE
========================================== */

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* ==========================================
   LOGIN ELEMENTS
========================================== */

const loginPage =
    document.getElementById(
        "loginPage"
    );

const loginForm =
    document.getElementById(
        "loginForm"
    );

const loginEmail =
    document.getElementById(
        "loginEmail"
    );

const loginPassword =
    document.getElementById(
        "loginPassword"
    );

const togglePassword =
    document.getElementById(
        "togglePassword"
    );

const googleLogin =
    document.getElementById(
        "googleLogin"
    );

const rememberMe =
    document.getElementById(
        "rememberMe"
    );

const forgotPassword =
    document.getElementById(
        "forgotPassword"
    );

const createAccount =
    document.getElementById(
        "createAccount"
    );


/* ==========================================
   PASSWORD SHOW / HIDE
========================================== */

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        () => {

            if (
                loginPassword.type ===
                "password"
            ) {

                loginPassword.type =
                    "text";

                togglePassword.textContent =
                    "🙈";

            } else {

                loginPassword.type =
                    "password";

                togglePassword.textContent =
                    "👁️";

            }

        }
    );

}


/* ==========================================
   LOGIN
========================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const email =
                loginEmail
                    ?.value
                    .trim();

            const password =
                loginPassword
                    ?.value;

            if (
                !email ||
                !password
            ) {

                alert(
                    "Please enter email and password."
                );

                return;
            }

            const savedUser =
                JSON.parse(
                    localStorage.getItem(
                        "finAIUser"
                    )
                );

            if (!savedUser) {

                alert(
                    "No account found. Please create an account first."
                );

                return;
            }

            if (
                email !==
                    savedUser.email ||
                password !==
                    savedUser.password
            ) {

                alert(
                    "❌ Incorrect email or password."
                );

                return;
            }

            localStorage.setItem(
                "studentFinanceLoggedIn",
                "true"
            );

            if (
                rememberMe &&
                rememberMe.checked
            ) {

                localStorage.setItem(
                    "finAIRemember",
                    "true"
                );

            }

            hideLogin();

            showToast(
                "Welcome back! 👋",
                "✓"
            );

        }
    );

}


/* ==========================================
   GOOGLE LOGIN
========================================== */

if (googleLogin) {

    googleLogin.addEventListener(
        "click",
        async () => {

            try {

                showToast(
                    "Connecting to Google...",
                    "🔐"
                );

                /*
                    ==================================
                    FIREBASE GOOGLE AUTH

                    Firebase connect karne ke baad
                    yahan signInWithPopup() use hoga.
                    ==================================
                */

                alert(
                    "Google Login setup pending.\n\n" +
                    "Firebase Authentication connect karne ke baad " +
                    "ye button actual Google login karega."
                );

            } catch (error) {

                console.error(
                    "GOOGLE LOGIN ERROR:",
                    error
                );

                showToast(
                    "Google login failed",
                    "❌"
                );

            }

        }
    );

}


/* ==========================================
   HIDE LOGIN
========================================== */

function hideLogin() {

    if (!loginPage) return;

    loginPage.style.opacity =
        "0";

    loginPage.style.pointerEvents =
        "none";

    setTimeout(
        () => {

            loginPage.style.display =
                "none";

        },
        300
    );

}


/* ==========================================
   SHOW LOGIN
========================================== */

function showLogin() {

    if (!loginPage) return;

    loginPage.style.display =
        "flex";

    setTimeout(
        () => {

            loginPage.style.opacity =
                "1";

            loginPage.style.pointerEvents =
                "auto";

        },
        10
    );

}


/* ==========================================
   FORGOT PASSWORD
========================================== */

const forgotModal =
    document.getElementById(
        "forgotModal"
    );

const closeForgot =
    document.getElementById(
        "closeForgot"
    );

const backToLoginFromForgot =
    document.getElementById(
        "backToLoginFromForgot"
    );

const forgotForm =
    document.getElementById(
        "forgotForm"
    );

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        () => {

            forgotModal?.classList.add(
                "show"
            );

        }
    );

}

if (closeForgot) {

    closeForgot.addEventListener(
        "click",
        () => {

            forgotModal?.classList.remove(
                "show"
            );

        }
    );

}

if (backToLoginFromForgot) {

    backToLoginFromForgot.addEventListener(
        "click",
        () => {

            forgotModal?.classList.remove(
                "show"
            );

        }
    );

}

if (forgotModal) {

    forgotModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                forgotModal
            ) {

                forgotModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* ==========================================
   FORGOT PASSWORD FORM
========================================== */

if (forgotForm) {

    forgotForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const email =
                document
                    .getElementById(
                        "forgotEmail"
                    )
                    ?.value
                    .trim();

            if (!email) {

                alert(
                    "Please enter your email."
                );

                return;
            }

            const savedUser =
                JSON.parse(
                    localStorage.getItem(
                        "finAIUser"
                    )
                );

            if (
                !savedUser ||
                savedUser.email !== email
            ) {

                alert(
                    "No account found with this email."
                );

                return;
            }

            alert(
                "Password reset demo link sent to " +
                email
            );

            forgotForm.reset();

            forgotModal?.classList.remove(
                "show"
            );

        }
    );

}


/* ==========================================
   CREATE ACCOUNT
========================================== */

const signupModal =
    document.getElementById(
        "signupModal"
    );

const closeSignup =
    document.getElementById(
        "closeSignup"
    );

const backToLoginFromSignup =
    document.getElementById(
        "backToLoginFromSignup"
    );

const signupForm =
    document.getElementById(
        "signupForm"
    );

if (createAccount) {

    createAccount.addEventListener(
        "click",
        () => {

            signupModal?.classList.add(
                "show"
            );

        }
    );

}

if (closeSignup) {

    closeSignup.addEventListener(
        "click",
        () => {

            signupModal?.classList.remove(
                "show"
            );

        }
    );

}

if (backToLoginFromSignup) {

    backToLoginFromSignup.addEventListener(
        "click",
        () => {

            signupModal?.classList.remove(
                "show"
            );

        }
    );

}

if (signupModal) {

    signupModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                signupModal
            ) {

                signupModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* ==========================================
   SIGNUP FORM
========================================== */

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const name =
                document
                    .getElementById(
                        "signupName"
                    )
                    ?.value
                    .trim();

            const email =
                document
                    .getElementById(
                        "signupEmail"
                    )
                    ?.value
                    .trim();

            const password =
                document
                    .getElementById(
                        "signupPassword"
                    )
                    ?.value;

            const confirmPassword =
                document
                    .getElementById(
                        "signupConfirmPassword"
                    )
                    ?.value;

            if (
                !name ||
                !email ||
                !password ||
                !confirmPassword
            ) {

                alert(
                    "Please fill all fields."
                );

                return;
            }

            if (
                password.length < 6
            ) {

                alert(
                    "Password must contain at least 6 characters."
                );

                return;
            }

            if (
                password !==
                confirmPassword
            ) {

                alert(
                    "❌ Passwords do not match."
                );

                return;
            }

            const existingUser =
                JSON.parse(
                    localStorage.getItem(
                        "finAIUser"
                    )
                );

            if (
                existingUser &&
                existingUser.email === email
            ) {

                alert(
                    "An account with this email already exists."
                );

                return;
            }

            const user = {

                name,
                email,
                password

            };

            localStorage.setItem(
                "finAIUser",
                JSON.stringify(user)
            );

            localStorage.setItem(
                "studentFinanceLoggedIn",
                "true"
            );

            signupForm.reset();

            signupModal?.classList.remove(
                "show"
            );

            hideLogin();

            showToast(
                "Account created successfully! 🎉",
                "✓"
            );

        }
    );

}


/* ==========================================
   LOGOUT
========================================== */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );

            if (!confirmed) {
                return;
            }

            localStorage.removeItem(
                "studentFinanceLoggedIn"
            );

            localStorage.removeItem(
                "finAIGuest"
            );

            showLogin();

            showToast(
                "Logged out successfully 👋",
                "✓"
            );

        }
    );

}


/* ==========================================
   AUTO LOGIN
========================================== */

if (
    localStorage.getItem(
        "studentFinanceLoggedIn"
    ) === "true"
) {

    hideLogin();

} else {

    showLogin();

}


/* ==========================================
   INITIAL LOAD
========================================== */

updateDashboard();