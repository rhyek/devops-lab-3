import React, { PropsWithChildren, useState, useEffect, useContext } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { TaskDocument } from '../../../@shared/types/task';

interface DataContext {
  tasks: TaskDocument[];
}

const DataContext = React.createContext<DataContext>(null as any);

export function DataProvider({ children }: PropsWithChildren<{}>) {
  const [tasks, setTasks] = useState<TaskDocument[]>([]);

  useEffect(() => {
    const dispose = firebase
      .firestore()
      .collection('tasks')
      .onSnapshot(snapshot => {
        setTasks(
          snapshot.docs.map(doc => {
            return doc.data() as TaskDocument;
          }),
        );
      });
    return () => {
      dispose();
    };
  }, []);

  return <DataContext.Provider value={{ tasks }}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
