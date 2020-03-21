import React, { PropsWithChildren, useState, useEffect, useContext } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { TaskDocument } from '../../../@shared/types/todo';

interface DataContext {
  todos: TaskDocument[];
}

const DataContext = React.createContext<DataContext>(null as any);

export function DataProvider({ children }: PropsWithChildren<{}>) {
  const [todos, setTodos] = useState<TaskDocument[]>([]);

  useEffect(() => {
    const dispose = firebase
      .firestore()
      .collection('todos')
      .onSnapshot(snapshot => {
        setTodos(
          snapshot.docs.map(doc => {
            return doc.data() as TaskDocument;
          }),
        );
      });
    return () => {
      dispose();
    };
  }, []);

  return <DataContext.Provider value={{ todos }}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
