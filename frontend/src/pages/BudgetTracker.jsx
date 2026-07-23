import { useEffect, useState } from "react";

import {
  getBudgets,
  getBudget,
  createBudget,
  deleteBudget,
  addExpense,
  deleteExpense
} from "../api/budgetAPI";


export default function BudgetTracker() {

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [tripName, setTripName] = useState("");
  const [budgetType, setBudgetType] = useState("trip");
  const [amount, setAmount] = useState("");

  const [selectedBudget, setSelectedBudget] = useState(null);

  const [expCategory, setExpCategory] = useState("");
  const [expDescription, setExpDescription] = useState("");
  const [expAmount, setExpAmount] = useState("");



  async function loadBudgets() {

    try {

      setLoading(true);

      const data = await getBudgets();

      setBudgets(Array.isArray(data) ? data : []);

    }
    catch(error) {

      console.error(error);

    }
    finally {

      setLoading(false);

    }

  }



  useEffect(() => {

    loadBudgets();

  }, []);





  async function saveBudget() {

    if(!tripName.trim() || !amount)
      return;


    await createBudget({
      tripName,
      budgetType,
      amount
    });


    setTripName("");

    setBudgetType("trip");

    setAmount("");

    setShowForm(false);

    loadBudgets();

  }





  async function removeBudget(id) {

    await deleteBudget(id);

    if(selectedBudget && selectedBudget.id === id) {

      setSelectedBudget(null);

    }

    loadBudgets();

  }





  async function openBudget(id) {

    const data = await getBudget(id);

    setSelectedBudget(data);

  }





  async function saveExpense() {

    if(!expAmount)
      return;


    await addExpense(
      selectedBudget.id,
      {
        category: expCategory,
        description: expDescription,
        amount: expAmount
      }
    );


    setExpCategory("");

    setExpDescription("");

    setExpAmount("");


    const data = await getBudget(selectedBudget.id);

    setSelectedBudget(data);

    loadBudgets();

  }





  async function removeExpense(id) {

    await deleteExpense(id);

    const data = await getBudget(selectedBudget.id);

    setSelectedBudget(data);

    loadBudgets();

  }





function getRawPercent(budget) {

    return (budget.spent / budget.amount) * 100;

}



function getBarPercent(budget) {

    return Math.min(getRawPercent(budget), 100);

}




  function isOverLimit(budget) {

    if(budget.budget_type === "daily") {

      return Number(budget.spent_today) > Number(budget.amount);

    }

    return Number(budget.spent) > Number(budget.amount);

  }





  return (

    <div className="page">

      <main className="subpage-content">


        <h2>Budget Tracker</h2>

        <p className="subpage-subtitle">
          Set a budget, track your spending, and get warned before you go over.
        </p>



        {
          !selectedBudget &&

          <>

            <button
              onClick={() => setShowForm(true)}
              style={{
                width:"50px",
                height:"50px",
                borderRadius:"50%",
                border:"none",
                fontSize:"30px",
                cursor:"pointer",
                marginBottom:"24px"
              }}
            >
              +
            </button>



            {
              showForm &&

              <div
                className="contact-card"
                style={{
                  width:"100%",
                  maxWidth:"800px",
                  background:"#0b1e30",
                  border:"1px solid #b7d7ef",
                  marginBottom:"24px"
                }}
              >

                <h3
                  style={{
                    color:"#fff",
                    fontSize:"24px",
                    marginBottom:"16px"
                  }}
                >
                  New Budget
                </h3>



                <input
                  type="text"
                  placeholder="Trip name..."
                  value={tripName}
                  onChange={(e)=>setTripName(e.target.value)}
                  style={{
                    width:"100%",
                    padding:"12px",
                    marginBottom:"12px",
                    borderRadius:"8px",
                    border:"1px solid #4f5c69",
                    background:"#1b2f42",
                    color:"#fff"
                  }}
                />



                <select
                  value={budgetType}
                  onChange={(e)=>setBudgetType(e.target.value)}
                  style={{
                    width:"100%",
                    padding:"12px",
                    marginBottom:"12px",
                    borderRadius:"8px",
                    border:"1px solid #4f5c69",
                    background:"#1b2f42",
                    color:"#fff"
                  }}
                >
                  <option value="trip">Whole Trip Budget</option>
                  <option value="daily">Daily Budget</option>
                </select>



                <input
                  type="number"
                  placeholder="Amount..."
                  value={amount}
                  onChange={(e)=>setAmount(e.target.value)}
                  style={{
                    width:"100%",
                    padding:"12px",
                    marginBottom:"12px",
                    borderRadius:"8px",
                    border:"1px solid #4f5c69",
                    background:"#1b2f42",
                    color:"#fff"
                  }}
                />



                <button
                  onClick={saveBudget}
                  style={{
                    marginTop:"12px",
                    padding:"12px 24px",
                    borderRadius:"8px",
                    border:"none",
                    background:"#fff",
                    color:"#0b1e30",
                    fontWeight:"bold",
                    cursor:"pointer"
                  }}
                >
                  Save
                </button>



                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    marginLeft:"12px",
                    padding:"12px 24px",
                    borderRadius:"8px",
                    border:"none",
                    cursor:"pointer"
                  }}
                >
                  Cancel
                </button>


              </div>

            }





            {
              loading &&

              <p style={{color:"#fff"}}>
                Loading...
              </p>

            }





            <div
              style={{
                width:"100%",
                maxWidth:"800px"
              }}
            >

              {
                budgets.map(budget => (

                  <div
                    key={budget.id}
                    style={{
                      padding:"16px",
                      marginBottom:"12px",
                      background:"#1b2f42",
                      borderRadius:"8px",
                      cursor:"pointer"
                    }}
                    onClick={() => openBudget(budget.id)}
                  >



                    <div
                      style={{
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"space-between",
                        marginBottom:"8px"
                      }}
                    >

                      <h3
                        style={{
                          color:"#fff",
                          margin:0
                        }}
                      >
                        {budget.trip_name}
                      </h3>



                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBudget(budget.id);
                        }}
                        title="Delete"
                        style={{
                          width:"40px",
                          height:"40px",
                          border:"none",
                          borderRadius:"8px",
                          cursor:"pointer",
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center"
                        }}
                      >

                        <span className="material-symbols-outlined">
                          delete
                        </span>

                      </button>


                    </div>



                    <p
                      style={{
                        color:"#b7d7ef",
                        marginBottom:"8px"
                      }}
                    >
                      {budget.budget_type === "daily" ? "Daily Budget" : "Trip Budget"}
                      {" — "}
                      ${Number(budget.spent).toFixed(2)} / ${Number(budget.amount).toFixed(2)}
                      {" ("}{getRawPercent(budget).toFixed(1)}%{" used)"}
                    </p>



                    <div
                      style={{
                        width:"100%",
                        height:"10px",
                        background:"#0b1e30",
                        borderRadius:"6px",
                        overflow:"hidden"
                      }}
                    >

                      <div
                        style={{
                          width:`${getBarPercent(budget)}%`,
                          height:"100%",
                          background: isOverLimit(budget) ? "#e05252" : "#7fd97f"
                        }}
                      />

                    </div>



                    {
                      isOverLimit(budget) &&

                      <p
                        style={{
                          color:"#e05252",
                          marginTop:"8px",
                          fontWeight:"bold"
                        }}
                      >
                        ⚠ Over budget!
                      </p>

                    }


                  </div>

                ))
              }


            </div>


          </>

        }





        {
          selectedBudget &&

          <div
            style={{
              width:"100%",
              maxWidth:"800px"
            }}
          >

            <button
              onClick={() => setSelectedBudget(null)}
              style={{
                marginBottom:"24px",
                padding:"10px 20px",
                borderRadius:"8px",
                border:"none",
                cursor:"pointer"
              }}
            >
              ← Back to Budgets
            </button>



            <h3 style={{ color:"#fff" }}>
              {selectedBudget.trip_name}
            </h3>



            <p style={{ color:"#b7d7ef", marginBottom:"16px" }}>
              {selectedBudget.budget_type === "daily" ? "Daily Budget" : "Trip Budget"}
              {" — "}
              ${Number(selectedBudget.spent).toFixed(2)} / ${Number(selectedBudget.amount).toFixed(2)} spent
             {" ("}{getRawPercent(selectedBudget).toFixed(1)}%{" used)"}
              {selectedBudget.budget_type === "daily" &&
                ` (Today: $${Number(selectedBudget.spent_today).toFixed(2)})`
              }
            </p>



            {
              isOverLimit(selectedBudget) &&

              <p
                style={{
                  color:"#e05252",
                  marginBottom:"16px",
                  fontWeight:"bold"
                }}
              >
                ⚠ You have exceeded your {selectedBudget.budget_type === "daily" ? "daily" : "trip"} spending limit!
              </p>

            }



            <div
              className="contact-card"
              style={{
                background:"#0b1e30",
                border:"1px solid #b7d7ef",
                marginBottom:"24px"
              }}
            >

              <h4 style={{ color:"#fff", marginBottom:"12px" }}>
                Add Expense
              </h4>



              <input
                type="text"
                placeholder="Category (e.g. Food, Transport)..."
                value={expCategory}
                onChange={(e)=>setExpCategory(e.target.value)}
                style={{
                  width:"100%",
                  padding:"12px",
                  marginBottom:"12px",
                  borderRadius:"8px",
                  border:"1px solid #4f5c69",
                  background:"#1b2f42",
                  color:"#fff"
                }}
              />



              <input
                type="text"
                placeholder="Description..."
                value={expDescription}
                onChange={(e)=>setExpDescription(e.target.value)}
                style={{
                  width:"100%",
                  padding:"12px",
                  marginBottom:"12px",
                  borderRadius:"8px",
                  border:"1px solid #4f5c69",
                  background:"#1b2f42",
                  color:"#fff"
                }}
              />



              <input
                type="number"
                placeholder="Amount..."
                value={expAmount}
                onChange={(e)=>setExpAmount(e.target.value)}
                style={{
                  width:"100%",
                  padding:"12px",
                  marginBottom:"12px",
                  borderRadius:"8px",
                  border:"1px solid #4f5c69",
                  background:"#1b2f42",
                  color:"#fff"
                }}
              />



              <button
                onClick={saveExpense}
                style={{
                  padding:"12px 24px",
                  borderRadius:"8px",
                  border:"none",
                  background:"#fff",
                  color:"#0b1e30",
                  fontWeight:"bold",
                  cursor:"pointer"
                }}
              >
                Add Expense
              </button>


            </div>



            {
              selectedBudget.expenses && selectedBudget.expenses.map(expense => (

                <div
                  key={expense.id}
                  style={{
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"space-between",
                    padding:"16px",
                    marginBottom:"12px",
                    background:"#1b2f42",
                    borderRadius:"8px"
                  }}
                >

                  <div>

                    <p style={{ color:"#fff", margin:0, fontWeight:"bold" }}>
                      {expense.description || "(No description)"}
                    </p>

                    <p style={{ color:"#b7d7ef", margin:0, fontSize:"14px" }}>
                      {expense.category || "Uncategorized"} — ${Number(expense.amount).toFixed(2)}
                    </p>

                  </div>



                  <button
                    onClick={() => removeExpense(expense.id)}
                    title="Delete"
                    style={{
                      width:"40px",
                      height:"40px",
                      border:"none",
                      borderRadius:"8px",
                      cursor:"pointer",
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center"
                    }}
                  >

                    <span className="material-symbols-outlined">
                      delete
                    </span>

                  </button>


                </div>

              ))
            }


          </div>

        }


      </main>


    </div>

  );

} 