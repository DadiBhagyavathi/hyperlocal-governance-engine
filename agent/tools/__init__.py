from .db_tools import (
    search_complaints_db,
    search_projects_db,
    get_budget_analytics,
)
from .ml_tools import (
    predict_delay_risk,
    summarize_citizen_feedback,
    classify_complaint_text,
)
from .report_tools import (
    generate_governance_report,
    explain_project_risks,
)

ALL_TOOLS = [
    search_complaints_db,
    search_projects_db,
    get_budget_analytics,
    predict_delay_risk,
    summarize_citizen_feedback,
    classify_complaint_text,
    generate_governance_report,
    explain_project_risks,
]
