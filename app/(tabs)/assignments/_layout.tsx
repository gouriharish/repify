import { Stack } from "expo-router";

export default function AssignmentsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />

      <Stack.Screen 
        name="assignment-details" 
        options={{ headerShown: false }} 
      />
<Stack.Screen 
        name="view-submissions" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="edit" 
        options={{ presentation: "modal", headerShown: false }} 
      />

      <Stack.Screen
        name="mark-submissions"
        options={{ headerShown: false }}
      />
    </Stack>
    
  );
}
