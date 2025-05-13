from pytz import timezone # type: ignore
from models import ActivityLog
from datetime import datetime
from sqlalchemy.orm import Session

def log_activity(db: Session, type: str, message: str):
    ist = timezone("Asia/Kolkata")
    log = ActivityLog(type=type, message=message, timestamp=datetime.now(ist))
    db.add(log)
    db.commit()
