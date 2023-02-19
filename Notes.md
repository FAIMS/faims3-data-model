# Task in Refactoring

* datamodel/typesystem.ts should be types.ts and have all exported types
 and only have types, currently it has some functions and other types are
 defined elsewhere

* External modules that are imported - need a way to handle these
  * getDataDB from 'sync'
  * shouldDisplayRecord from 'users'

* the type TokenInfo references KeyLike from jose, in FAIMS3 it's only 
  used in the 'user' module so could probably be local to that module
  (unless we also want users in conductor).
