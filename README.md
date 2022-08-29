# projeto5-batepapouol

variable receiverRefreshed: 

This variable is necessary because, otherwise, if a participant is selected at the moment

that him sign out, we will have none terms in the <ul> list having ".selected" class. This will give us an 

error of null elements found at querySelector callback on the next refreshing participants list cicle. 

To avoid that, receiverRfreshed returns 'False' if the current refreshing of participants data don't find

any participant term with ".selected" class. In that case, we set the default participant "todos" as

selected, as we can see in "js ln 230".



ETL explained:
    
ETL is a process very common at data analysis, it consists in a three steps process: Extract, Transform and Load. 

- Extract is the methods that we use to redeem the data from a Database, getting the raw data needy of a
posterior treatment to improve your capability to provide meaningful results.

    Extract functions: extractFeedMessagesData(); extractParticipantsData();

- Transform is the union of process that change the format, structure or values of data, cleaning and
filtering the raw data, giving an enhancement in your capability to provide meaningful results.

    Transform functions: transformFeedMessagesData(); transformParticipantsData();

- Load is the final stage of ETL process, in this stage the treated data is made available for your
 consumption trough views, displays or any form of data visualization. After that, the user may be able
 to get the maximum value of desired information.
    
    Load functions: loadFeedMessages(); loadParticipantsList();
